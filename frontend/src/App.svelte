<script lang="ts" context="module">
  export function encodeQueryHash(query: string): string {
    return "#" + encodeURIComponent(query).replaceAll("%20", "+");
  }

  export function decodeQueryHash(hash: string): string {
    return decodeURIComponent(hash.slice(1).replaceAll("+", "%20"));
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import Course from "./lib/Course.svelte";
  import Footer from "./lib/Footer.svelte";
  import QueryLink from "./lib/QueryLink.svelte";
  import { createSearcher, normalizeText } from "./lib/search";
  import { fly, scale } from "svelte/transition";

  let query: string = location.hash ? decodeQueryHash(location.hash) : "";
  $: {
    const newUrl = query
      ? encodeQueryHash(query)
      : location.pathname + location.search;
    history.replaceState(null, "", newUrl);
  }

  let landing = query === "";
  $: if (query) landing = false;

  let currentYear = true;
  let genEdChecks: boolean[] = new Array(4).fill(false);
  let genEdAreas: string[] = ["HSI", "STS", "EC", "AC"];

  const { data, error, search } = createSearcher();
  let finalQuery = "";

  // See if user searches for gen-eds.
  $: genEdQuery = query.toLowerCase().includes("gened");

  // As soon as the user no longer searches for gen-eds, get rid of checked boxes.
  $: if (!genEdQuery) {
    genEdChecks.fill(false);
  }

  // Search for GENED areas, if boxes are checked and "gened" remains in the search box.
  $: {
    // Get | separated string of checked GENED areas.
    let stringTags: string[] = genEdChecks.map((checked, i) =>
      checked ? genEdAreas[i] : ""
    );
    let genEdTagArr: string[] = [];
    stringTags.forEach((element) => {
      if (element) {
        genEdTagArr.push(element);
      }
    });
    let genEdSearchQuery = genEdTagArr.length
      ? " @genEdArea:{" + genEdTagArr.join("|") + "} "
      : "";

    // Add relevant year/gen-ed tags to query, if boxes checked.
    finalQuery =
      (currentYear ? "@academicYear:[2025 2025] " : "") +
      normalizeText(query) +
      (genEdQuery ? genEdSearchQuery : "");

    // If your query includes "gened", get only gen-ed classes.
    finalQuery = genEdQuery ? finalQuery + " @subject:GENED " : finalQuery;
    search(finalQuery);
  }

  // Render courses incrementally in batches of 20 at a time, to avoid slowing
  // down the browser with too many elements at once.
  let showing = 0;
  let showingTimeout = 0;

  function showMore() {
    const len = $data?.courses?.length ?? 0;
    if (showing < len) {
      showing += Math.min(20, len - showing);
      showingTimeout = window.setTimeout(showMore, 100);
    }
  }
  onMount(() =>
    data.subscribe(() => {
      window.clearTimeout(showingTimeout);
      showing = 0;
      showMore();
    })
  );

  let openCsStudentAd = false;
</script>

<main class="px-4 py-8 max-w-screen-md mx-auto" class:landing>
  <div class="landing-card">
    <h1 class="text-4xl font-bold mb-4">
      <a
        href="/"
        on:click|preventDefault={() => ((query = ""), (landing = true))}
        >classes.<span class="text-violet-500">wtf</span></a
      >
    </h1>

    {#if !landing}
      <div class="space-y-2 mb-3 text-sm text-zinc-600">
        <p>
          Try words, phrases, titles, subjects, course numbers, and instructor
          names. You can also look for exact textual phrases (like
          <QueryLink bind:query value={`"creative process"`} />) and prefix
          matches (such as
          <QueryLink bind:query value={`genom*`} />).
        </p>
        <p>
          Filter by specific attributes like
          <QueryLink bind:query value={`@subject:compsci`} />,
          <QueryLink bind:query value={`@semester:"fall 2024"`} />, and
          <QueryLink bind:query value={`@level:{graduate}`} />.
        </p>
        <p>
          If you're looking for Gen Ed courses, add <QueryLink
            bind:query
            value={`gened`}
          /> to your search.
        </p>
      </div>
    {/if}

    <p class="mb-4 text-xl">
      <span class="flavor">I just want to take a class about </span>
      <!-- svelte-ignore a11y-autofocus -->
      <span class="relative searchbar-wrapper"
        >{#if !landing}
          <svg
            class="w-5 h-5 absolute top-0 left-3 text-gray-400 pointer-events-none"
            fill="currentColor"
            viewBox="0 0 50 50"
            ><path
              d="M 21 3 C 11.601563 3 4 10.601563 4 20 C 4 29.398438 11.601563 37 21 37 C 24.355469 37 27.460938 36.015625 30.09375 34.34375 L 42.375 46.625 L 46.625 42.375 L 34.5 30.28125 C 36.679688 27.421875 38 23.878906 38 20 C 38 10.601563 30.398438 3 21 3 Z M 21 7 C 28.199219 7 34 12.800781 34 20 C 34 27.199219 28.199219 33 21 33 C 13.800781 33 8 27.199219 8 20 C 8 12.800781 13.800781 7 21 7 Z"
            /></svg
          >
        {/if}<input
          autofocus
          class="searchbar border-b border-gray-500 bg-gray-50 hover:bg-gray-100 focus:outline-none"
          placeholder={landing ? "" : "Search…"}
          bind:value={query}
        /></span
      >
      <span class="flavor">
        but searching the online catalog is so slow, and my results are largely
        irrelevant. WTF?</span
      >
    </p>

    {#if genEdQuery}
      <div class="flex text-sm mb-2">
        <b>Filter by GENED tag:</b>
        {#each genEdAreas as area, i}
          <label class="flex mr-1 items-center"
            ><input
              class="mx-2 align-middle"
              type="checkbox"
              bind:checked={genEdChecks[i]}
            />{area}</label
          >
        {/each}
      </div>
    {/if}

    {#if !landing}
      <label class="flex items-center text-sm mb-2">
        <input class="mr-2" type="checkbox" bind:checked={currentYear} />
        Only show AY 2024–2025 courses
      </label>
    {/if}

    <footer>
      <Footer />
    </footer>
  </div>

  {#if $error !== null}
    <p class="text-red-500 mb-4">
      {$error}
    </p>
  {/if}
  {#if query && $data}
    <p class="text-sm mb-4 bg-green-50 px-2 py-1 border border-green-500">
      Found {$data.count} results
      <span class="text-gray-500">({($data.time * 1000).toFixed(2)} ms)</span>
    </p>

    <div class="space-y-4">
      {#each ($data.courses ?? []).slice(0, showing) as course (course.id)}
        <Course data={course} />
      {/each}
    </div>
  {/if}
</main>

<aside class="hidden md:block fixed bottom-0 right-0 p-4">
  <button
    class="border px-4 py-2 rounded-lg shadow-md hover:border-sky-500 hover:bg-sky-50 hover:text-sky-900 active:scale-105 active:shadow-lg transition-all"
    on:click={() => (openCsStudentAd = true)}
  >
    <span class="mr-1">👋</span> For CS students</button
  >
</aside>

{#if openCsStudentAd}
  <section
    class="hidden md:block fixed inset-0 bg-gradient-to-br from-amber-50/80 to-red-100/80 backdrop-blur-sm overflow-auto"
    in:fly={{ x: 100 }}
    out:fly={{ x: -100 }}
  >
    <div class="text-2xl p-8 max-w-screen-md">
      <h2 class="font-bold mb-6">Hi from Eric!</h2>
      <p class="mb-6">
        Welcome to <em>classes.wtf</em>. If you're seeing this, I hope you're
        having a great day! (And that Harvard is a transformative experience
        rather than eating your soul. :D)
      </p>
      <p class="mb-6">
        I made this site in 2022 as an easy way to get information about
        classes. Just that, and nothing else. It spreads through word-of-mouth
        between friends, PAFs, dorm lists, classmates…
      </p>
      <p class="mb-6">
        Right now we're looking for maintainers! Before each semester we need to
        update the course catalog and share the site with students, but you can
        also explore new features. If you're interested, please reach me at <a
          class="underline"
          href="mailto:ekzhang1@gmail.com">ekzhang1@gmail.com</a
        >.
      </p>
      <button
        class="px-5 py-3 rounded-lg border border-black hover:shadow-md active:scale-105 transition-all"
        on:click={() => (openCsStudentAd = false)}>Okay, got it!</button
      >
    </div>
  </section>
{/if}

<style lang="postcss">
  @screen md {
    .landing {
      @apply min-h-screen max-w-none flex flex-col justify-center py-12;
    }

    .landing .landing-card {
      @apply relative w-[724px] p-6 rounded-2xl bg-white shadow-lg mx-auto border;
    }

    .landing .landing-card::before {
      content: "";
      @apply absolute inset-0 -z-10 -rotate-6 bg-gradient-to-r from-rose-400 to-indigo-400 rounded-2xl;
    }

    .landing h1 {
      @apply text-center text-6xl mb-8;
    }

    .landing p {
      @apply text-3xl text-center mb-12;
    }

    .landing input {
      @apply w-[10ch] px-1;
    }
  }

  main:not(.landing) .flavor {
    @apply hidden;
  }

  main:not(.landing) .searchbar-wrapper {
    @apply text-base;
  }

  main:not(.landing) .searchbar {
    @apply w-full px-3 py-2 pl-10;
  }

  main:not(.landing) footer {
    @apply hidden;
  }
</style>
