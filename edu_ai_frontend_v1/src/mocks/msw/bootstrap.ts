export async function bootstrapMocking() {
  try {
    const { worker } = await import("./browser");
    await worker.start({
      onUnhandledRequest: "bypass"
    });
  } catch (error) {
    console.warn("MSW bootstrap skipped:", error);
  }
}
