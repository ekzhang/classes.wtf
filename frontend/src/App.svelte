<script lang="ts">
  import Counter from "./lib/Counter.svelte";
</script>

<h1 class="text-2xl font-bold">Sorry, we're not ready yet!</h1>

<p>
  Only the ⚡️-fast API is available (here's <a
    href="/search?q=art+history"
    class="text-blue-600 hover:underline">an example</a
  >). I promise I'm making a sweet interface though. :)
</p>

<Counter />

<style lang="postcss">
  h1 {
    @apply hover:underline;
  }
</style>
