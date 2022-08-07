<script lang="ts">
  import Counter from "./lib/Counter.svelte";
</script>

<h1 class="text-2xl font-bold">Counter</h1>

<Counter />

<style lang="postcss">
  h1 {
    @apply hover:underline;
  }
</style>
