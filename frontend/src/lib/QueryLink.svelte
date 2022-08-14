<script lang="ts">
  import { encodeQueryHash } from "../App.svelte";

  export let query: string; // for binding
  export let value: string;
</script>

<a
  class="text-indigo-500 hover:underline"
  href={encodeQueryHash(value)}
  on:click|preventDefault={() => (query = value)}>{value}</a
>
