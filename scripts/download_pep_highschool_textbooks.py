from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urljoin

import requests
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
from PIL import Image

CATALOG_URL = "https://jc.pep.com.cn/dataOnline.js"
BOOK_HOST = "https://book.pep.com.cn"
KEY = b"1234123412ABCDEF"
IV = b"ABCDEF1234123412"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36"
)

DEFAULT_SUBJECTS = [
    "思想政治",
    "语文",
    "数学",
    "英语",
    "物理",
    "化学",
    "生物学",
    "历史",
    "地理",
    "信息技术",
    "通用技术",
    "日语",
    "俄语",
    "艺术",
    "体育与健康",
    "美术",
]

GRADE_ORDER = {
    "必修": 10,
    "选择性必修": 20,
    "选修": 30,
    "专项": 40,
}

BOOK_PART_ORDER = {
    "第一册": 1,
    "第二册": 2,
    "第三册": 3,
    "第四册": 4,
    "第五册": 5,
    "第六册": 6,
    "上册": 10,
    "中册": 11,
    "下册": 12,
    "全一册": 20,
}

INVALID_FILENAME_CHARS = re.compile(r'[<>:"/\\|?*\x00-\x1F]')


def sanitize_filename(value: str) -> str:
    value = INVALID_FILENAME_CHARS.sub("_", value)
    value = re.sub(r"\s+", " ", value).strip(" .")
    return value or "untitled"


def request_with_retries(
    session: requests.Session,
    url: str,
    *,
    referer: str,
    stream: bool = False,
    timeout: int = 30,
    retries: int = 3,
) -> requests.Response:
    headers = {
        "User-Agent": USER_AGENT,
        "Referer": referer,
    }
    last_error: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            response = session.get(url, headers=headers, stream=stream, timeout=timeout)
            response.raise_for_status()
            return response
        except Exception as exc:
            last_error = exc
            if attempt < retries:
                time.sleep(1.5 * attempt)
    raise RuntimeError(f"请求失败: {url}") from last_error


def fetch_text_with_curl(url: str, referer: str) -> str:
    curl = shutil.which("curl.exe") or shutil.which("curl")
    if not curl:
        raise RuntimeError("requests 被拦截，且系统中没有找到 curl.exe/curl")

    result = subprocess.run(
        [curl, "-L", "-sS", "-A", USER_AGENT, "-e", referer, url],
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return result.stdout


def fetch_catalog(session: requests.Session) -> list[dict[str, Any]]:
    try:
        response_text = request_with_retries(
            session, CATALOG_URL, referer="https://jc.pep.com.cn/"
        ).text
    except Exception:
        response_text = fetch_text_with_curl(CATALOG_URL, "https://jc.pep.com.cn/")

    match = re.search(r'var str = "([A-F0-9]+)"', response_text)
    if not match:
        response_text = fetch_text_with_curl(CATALOG_URL, "https://jc.pep.com.cn/")
        match = re.search(r'var str = "([A-F0-9]+)"', response_text)
    if not match:
        raise RuntimeError("没有在 dataOnline.js 中找到加密目录字符串")

    cipher = AES.new(KEY, AES.MODE_CBC, IV)
    decrypted = unpad(cipher.decrypt(bytes.fromhex(match.group(1))), AES.block_size)
    payload = json.loads(decrypted.decode("utf-8"))
    return payload["data"]


def selected_books(catalog: Iterable[dict[str, Any]], subjects: list[str]) -> list[dict[str, Any]]:
    subject_order = {subject: index for index, subject in enumerate(subjects)}
    books = [
        dict(item)
        for item in catalog
        if item.get("xd") == "高中"
        and item.get("sydx") == "学生"
        and item.get("xk") in subject_order
    ]
    books.sort(
        key=lambda item: (
            subject_order[item["xk"]],
            GRADE_ORDER.get(item.get("nj", ""), 999),
            BOOK_PART_ORDER.get(item.get("cc", ""), 999),
            item.get("title", ""),
            item.get("id", ""),
        )
    )
    return books


def resolve_page_count(session: requests.Session, book: dict[str, Any]) -> int:
    book_id = book["id"]
    index_url = f"{BOOK_HOST}/{book_id}/mobile/index.html"
    config_url = f"{BOOK_HOST}/{book_id}/mobile/javascript/config.js"
    response = request_with_retries(session, config_url, referer=index_url)
    match = re.search(r"bookConfig\.totalPageCount\s*=\s*(\d+)", response.text)
    if not match:
        raise RuntimeError(f"没有解析到页数: {book['title']} ({book_id})")
    return int(match.group(1))


def image_url(book_id: str, page: int) -> str:
    return urljoin(f"{BOOK_HOST}/{book_id}/", f"files/mobile/{page}.jpg")


def download_image(
    session: requests.Session,
    book: dict[str, Any],
    page: int,
    image_path: Path,
    *,
    overwrite: bool,
) -> None:
    if image_path.exists() and image_path.stat().st_size > 0 and not overwrite:
        return

    image_path.parent.mkdir(parents=True, exist_ok=True)
    book_id = book["id"]
    index_url = f"{BOOK_HOST}/{book_id}/mobile/index.html"
    response = request_with_retries(
        session,
        image_url(book_id, page),
        referer=index_url,
        stream=True,
        timeout=60,
    )
    content_type = response.headers.get("Content-Type", "")
    if "image" not in content_type:
        raise RuntimeError(f"第 {page} 页返回的不是图片: {book['title']} ({content_type})")

    temp_path = image_path.with_suffix(".jpg.part")
    with temp_path.open("wb") as file:
        for chunk in response.iter_content(chunk_size=1024 * 512):
            if chunk:
                file.write(chunk)
    temp_path.replace(image_path)


def make_pdf(image_paths: list[Path], pdf_path: Path) -> None:
    pdf_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        import img2pdf  # type: ignore

        with pdf_path.open("wb") as output:
            output.write(img2pdf.convert([str(path) for path in image_paths]))
        return
    except ImportError:
        pass

    try:
        from pypdf import PdfReader, PdfWriter

        writer = PdfWriter()
        readers = []
        with tempfile.TemporaryDirectory(prefix="pep_page_pdf_") as temp_dir:
            temp_root = Path(temp_dir)
            page_pdfs: list[Path] = []
            for index, image_path in enumerate(image_paths, start=1):
                page_pdf = temp_root / f"{index:04d}.pdf"
                with Image.open(image_path) as image:
                    rgb = image.convert("RGB")
                    rgb.save(page_pdf, "PDF", resolution=100.0)
                page_pdfs.append(page_pdf)

            for page_pdf in page_pdfs:
                reader = PdfReader(str(page_pdf))
                readers.append(reader)
                writer.add_page(reader.pages[0])

            with pdf_path.open("wb") as output:
                writer.write(output)
        return
    except ImportError:
        pass

    first, *rest_paths = image_paths
    with Image.open(first) as first_image:
        first_rgb = first_image.convert("RGB")
        rest_images = []
        try:
            for image_path in rest_paths:
                image = Image.open(image_path).convert("RGB")
                rest_images.append(image)
            first_rgb.save(pdf_path, save_all=True, append_images=rest_images)
        finally:
            for image in rest_images:
                image.close()


def download_book(
    session: requests.Session,
    book: dict[str, Any],
    output_dir: Path,
    *,
    keep_images: bool,
    overwrite: bool,
) -> Path:
    page_count = int(book["page_count"])
    subject_dir = output_dir / sanitize_filename(book["xk"])
    filename = f"{sanitize_filename(book['title'])} [{book['id']}].pdf"
    pdf_path = subject_dir / filename
    if pdf_path.exists() and pdf_path.stat().st_size > 0 and not overwrite:
        print(f"SKIP PDF exists: {pdf_path}")
        return pdf_path

    image_dir = output_dir / "_pages" / sanitize_filename(book["xk"]) / f"{sanitize_filename(book['title'])}_{book['id']}"
    image_paths = [image_dir / f"{page:04d}.jpg" for page in range(1, page_count + 1)]

    for page, image_path in enumerate(image_paths, start=1):
        print(f"  page {page}/{page_count}: {book['title']}")
        download_image(session, book, page, image_path, overwrite=overwrite)

    make_pdf(image_paths, pdf_path)

    if not keep_images:
        for image_path in image_paths:
            image_path.unlink(missing_ok=True)
        try:
            image_dir.rmdir()
        except OSError:
            pass

    return pdf_path


def write_manifest(output_dir: Path, books: list[dict[str, Any]], subjects: list[str]) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = output_dir / "pep_highschool_manifest.json"
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": CATALOG_URL,
        "stage": "高中",
        "subjects": subjects,
        "total": len(books),
        "books": books,
    }
    manifest_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return manifest_path


def print_summary(books: list[dict[str, Any]]) -> None:
    by_subject: dict[str, int] = {}
    for book in books:
        by_subject[book["xk"]] = by_subject.get(book["xk"], 0) + 1

    print(f"匹配到 {len(books)} 本高中学生用书")
    for subject, count in by_subject.items():
        print(f"  {subject}: {count}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="下载人民教育出版社 jc.pep.com.cn 高中教材。")
    parser.add_argument(
        "--out",
        default="output/pep_highschool_textbooks",
        help="输出目录，默认 output/pep_highschool_textbooks",
    )
    parser.add_argument(
        "--subjects",
        nargs="*",
        default=DEFAULT_SUBJECTS,
        help="只处理指定学科；默认处理用户列出的 16 个学科。",
    )
    parser.add_argument(
        "--resolve-pages",
        action="store_true",
        help="生成清单时也逐本解析页数。",
    )
    parser.add_argument(
        "--download",
        action="store_true",
        help="实际下载图片并合成 PDF。未加该参数时只生成清单。",
    )
    parser.add_argument(
        "--keep-images",
        action="store_true",
        help="合成 PDF 后保留逐页 JPG。",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="覆盖已有图片和 PDF。",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output_dir = Path(args.out)
    session = requests.Session()

    catalog = fetch_catalog(session)
    books = selected_books(catalog, args.subjects)

    if args.resolve_pages or args.download:
        for index, book in enumerate(books, start=1):
            if "page_count" not in book:
                book["page_count"] = resolve_page_count(session, book)
            print(f"[{index}/{len(books)}] {book['xk']} {book['title']} - {book['page_count']} pages")

    manifest_path = write_manifest(output_dir, books, args.subjects)
    print_summary(books)
    print(f"清单已写入: {manifest_path}")

    if not args.download:
        print("未开始下载 PDF。确认清单后，加 --download 即可开始批量下载。")
        return

    for index, book in enumerate(books, start=1):
        print(f"\n[{index}/{len(books)}] downloading: {book['title']}")
        pdf_path = download_book(
            session,
            book,
            output_dir,
            keep_images=args.keep_images,
            overwrite=args.overwrite,
        )
        print(f"PDF ready: {pdf_path}")


if __name__ == "__main__":
    main()
