<script lang="ts">
  import Course from "./lib/Course.svelte";
  import { createSearcher, normalizeText } from "./lib/search";

  let query: string = "";

  const { count, courses, error, search } = createSearcher();
  $: search(normalizeText(query));
  $: console.log(normalizeText(query));
</script>

<main class="p-4">
  <h1 class="text-4xl font-bold mb-4">
    classes.<span class="text-violet-500">wtf</span>
  </h1>

  <p class="font-bold">Sorry, we're not ready yet!</p>
  <p>I promise I'm working on a sweet interface though. :)</p>

  <hr class="my-8" />

  <p>
    I just want to take a class about
    <input
      class="border-b border-gray-400 focus:outline-none"
      bind:value={query}
    /> but searching the online catalog is so slow, and my results are largely irrelevant.
    WTF?
  </p>

  {#if $error !== null}
    <p class="text-red-500 mb-4">Error: {$error}</p>
  {/if}
  {#if $courses}
    <p class="mb-4">received {$count} result(s)</p>

    <div class="space-y-4">
      {#each $courses as course (course.id)}
        <Course data={course} />
      {/each}
    </div>
  {/if}
</main>
