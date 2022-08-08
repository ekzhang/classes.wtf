<script lang="ts">
  import type { CourseData } from "./search";

  export let data: CourseData;
</script>

<div>
  <h3 class="text-sm font-bold">
    {data.subject}
    {data.catalogNumber}
    {data.title ?? "[No Title]"} ({data.semester})
  </h3>
  <p class="text-sm mb-1">
    {#each data.courseInstructors as instructor, i}
      <a href={instructor.email && `mailto:${instructor.email.toLowerCase()}`}
        >{instructor.displayName}</a
      >{#if i < data.courseInstructors.length - 1}{", "}{/if}
    {/each}
  </p>
  <p class="text-xs font-light mb-1">
    {data.academicGroup} | {data.courseLevel} | {data.componentFiltered}
  </p>
  <div class="text-xs">
    {@html data.courseDescriptionLong
      .replaceAll("&nbsp;", "\xa0")
      .replaceAll(/<p>\s*<\/p>/g, "")}
  </div>
</div>
