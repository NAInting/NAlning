<template>
  <div class="chat-thread">
    <div v-for="message in messages" :key="message.id" class="bubble" :class="message.role">
      <strong>{{ message.role === "agent" ? "Student Agent" : "你" }}</strong>
      <p>{{ message.text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  messages: Array<{
    id: string;
    role: "user" | "agent";
    text: string;
  }>;
}>();
</script>
