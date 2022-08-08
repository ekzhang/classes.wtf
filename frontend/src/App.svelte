<script lang="ts">
  import Course from "./lib/Course.svelte";
  import { createSearcher, normalizeText } from "./lib/search";

  function encodeQueryHash(query: string): string {
    return "#" + encodeURIComponent(query).replaceAll("%20", "+");
  }

  function decodeQueryHash(hash: string): string {
    return decodeURIComponent(hash.slice(1).replaceAll("+", "%20"));
  }

  let query: string = location.hash ? decodeQueryHash(location.hash) : "";
  $: {
    const newUrl = query
      ? encodeQueryHash(query)
      : location.pathname + location.search;
    history.replaceState(null, "", newUrl);
  }

  const { data, error, search } = createSearcher();
  $: search(normalizeText(query));
</script>

<main class="p-4">
  <h1 class="text-4xl font-bold mb-4">
    classes.<span class="text-violet-500">wtf</span>
  </h1>

  <p class="font-bold">Sorry, we're not ready yet!</p>
  <p>I promise I'm working on a sweet interface though. :)</p>

  <hr class="my-8" />

  <p class="mb-4">
    I just want to take a class about
    <input
      class="border-b border-gray-400 focus:outline-none"
      bind:value={query}
    /> but searching the online catalog is so slow, and my results are largely irrelevant.
    WTF?
  </p>

  {#if $error !== null}
    <p class="text-red-500 mb-4">
      Error searching for <code>{normalizeText(query)}</code>: {$error}
    </p>
  {/if}
  {#if query && $data}
    <p class="mb-4">
      Found {$data.count} results
      <span class="text-gray-500">({($data.time * 1000).toFixed(2)} ms)</span>
    </p>

    <div class="space-y-4">
      {#each $data.courses ?? [] as course (course.id)}
        <Course data={course} />
      {/each}
    </div>
  {/if}
</main>
