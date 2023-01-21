<script lang="ts">
  import type { CourseData } from "./search";

  export let data: CourseData;

  function meetingString(data: CourseData) {
    const schedules = [];
    for (const pattern of data.meetingPatterns) {
      let ret = "";
      if (pattern.meetsOnMonday) ret += "M";
      if (pattern.meetsOnTuesday) ret += "Tu";
      if (pattern.meetsOnWednesday) ret += "W";
      if (pattern.meetsOnThursday) ret += "Th";
      if (pattern.meetsOnFriday) ret += "F";
      if (pattern.meetsOnSaturday) ret += "S";
      if (pattern.meetsOnSunday) ret += "Su";
      if (!ret) continue;
      if (pattern.startTime) {
        ret += " " + pattern.startTime;
        if (pattern.endTime) {
          ret += "-" + pattern.endTime;
        }
      }
      schedules.push(ret);
    }
    if (schedules.length === 0) return "TBA";
    return schedules.join(", ");
  }

  $: [season, _] = data.semester.split(" ");
  $: locatorYear = data.academicYear - 1; // for course website URLs
</script>

<div>
  <h3 class="text-sm font-bold">
    <span title={data.subjectDescription}>{data.subject}</span>
    {data.catalogNumber}:
    {data.title || "[No Title]"} ({data.semester})
  </h3>
  <p class="text-sm mb-1">
    {#each data.instructors as instructor, i}
      <a
        href={instructor.email
          ? `mailto:${instructor.email.toLowerCase()}`
          : undefined}>{instructor.name}</a
      >{#if i < data.instructors.length - 1}{", "}{/if}
    {/each}
  </p>
  <p class="text-xs font-light mb-1">
    {data.academicGroup} | {data.level} | {data.component}
    | {meetingString(data)}
  </p>
  <div class="text-xs mb-1">
    {@html data.description
      .replaceAll("&nbsp;", "\xa0")
      .replaceAll(/<p>\s*<\/p>/g, "")}
  </div>
  <div class="ext-links flex space-x-2">
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={data.qGuideId
        ? `https://course-evaluation-reports.fas.harvard.edu/fas/course_summary.html?course_id=${data.qGuideId}`
        : `https://qreports.fas.harvard.edu/home/courses?school=FAS&search=${data.subject}+${data.catalogNumber}`}
      >Q Guide</a
    >
    <a
      target="_blank"
      rel="noopener noreferrer"
      href="https://syllabus.harvard.edu/?course_id={data.externalId}"
      >Syllabus</a
    >
    <a
      target="_blank"
      rel="noopener noreferrer"
      href="https://locator.tlt.harvard.edu/course/colgsas-{data.externalId}/{locatorYear}/{season}"
      >Website</a
    >
  </div>
</div>

<style lang="postcss">
  .ext-links a {
    @apply text-gray-500 text-sm underline hover:text-black;
  }
</style>
