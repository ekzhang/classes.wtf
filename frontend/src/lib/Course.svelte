<script lang="ts">
  import type { CourseData } from "./search";

  export let data: CourseData;
</script>

<div>
  <h3 class="text-sm font-bold">
    {data.subject}
    {data.catalogNumber}
    {data.title} ({data.semester})
  </h3>
  <div class="text-xs">
    {@html data.courseDescriptionLong
      .replaceAll("&nbsp;", "\xa0")
      .replaceAll(/<p>\s*<\/p>/g, "")}
  </div>
</div>
