<script lang="ts">
  import type { CourseData } from "./search";

  export let data: CourseData;

  const levelCodes = {
    PRIMUGRD: "Introductory",
    UGRDGRAD: "Undergrad",
    PRIMGRAD: "Graduate",
  };

  function meetingString(data: CourseData) {
    const schedules = [];
    for (const pattern of data.courseMeetingPatterns) {
      let ret = "";
      if (pattern.meetsOnMonday) ret += "M";
      if (pattern.meetsOnTuesday) ret += "Tu";
      if (pattern.meetsOnWednesday) ret += "W";
      if (pattern.meetsOnThursday) ret += "Th";
      if (pattern.meetsOnFriday) ret += "F";
      if (pattern.meetsOnSaturday) ret += "S";
      if (pattern.meetsOnSunday) ret += "Su";
      if (!ret) continue;
      if (pattern.meetingTimeStartTod) {
        ret += " " + pattern.meetingTimeStartTod;
        if (pattern.meetingTimeEndTod) {
          ret += "-" + pattern.meetingTimeEndTod;
        }
      }
      schedules.push(ret);
    }
    if (schedules.length === 0) return "TBA";
    return schedules.join(", ");
  }

  $: [season, year] = data.semester.split(" ");
</script>

<div>
  <h3 class="text-sm font-bold">
    <span title={data.subjectDescription}>{data.subject}</span>
    {data.catalogNumber}:
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
    {data.academicGroup} | {levelCodes[data.courseLevel] ?? data.courseLevel} | {data.componentFiltered}
    | {meetingString(data)}
  </p>
  <div class="text-xs mb-1">
    {@html data.courseDescriptionLong
      .replaceAll("&nbsp;", "\xa0")
      .replaceAll(/<p>\s*<\/p>/g, "")}
  </div>
  <div class="ext-links flex space-x-2">
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={data.qGuideCourseId
        ? `https://course-evaluation-reports.fas.harvard.edu/fas/course_summary.html?course_id=${data.qGuideCourseId}`
        : `https://qreports.fas.harvard.edu/home/courses?school=FAS&search=${data.subject}+${data.catalogNumber}`}
      >Q Guide</a
    >
    <a
      target="_blank"
      rel="noopener noreferrer"
      href="https://syllabus.harvard.edu/?course_id={data.externalCourseId}"
      >Syllabus</a
    >
    <a
      target="_blank"
      rel="noopener noreferrer"
      href="https://locator.tlt.harvard.edu/course/colgsas-{data.externalCourseId}/{year}/{season}"
      >Website</a
    >
  </div>
</div>

<style lang="postcss">
  .ext-links a {
    @apply text-gray-500 text-sm underline hover:text-black;
  }
</style>
