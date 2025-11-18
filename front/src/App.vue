<script setup lang="ts">
import { ShieldCheck } from "lucide-vue-next";
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header
      class="h-16 flex items-center gap-2 px-4 bg-white/95 backdrop-blur shadow"
    >
      <ShieldCheck color="blue" :size="32" aria-hidden="true" />
      <span class="text-xl sm:text-2xl font-bold text-foreground"
        >AccessChecker</span
      >
    </header>

    <main class="flex-1 flex items-center justify-center">
      <RouterView />
    </main>

    <footer
      class="h-12 flex items-center justify-center py-6 bg-white/95 backdrop-blur shadow-inner"
    >
      Desenvolvido por Maria Negrão
    </footer>
  </div>
</template>

<style scoped></style>
