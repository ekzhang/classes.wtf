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

  $: console.log(data);
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
  <div class="text-xs">
    {@html data.courseDescriptionLong
      .replaceAll("&nbsp;", "\xa0")
      .replaceAll(/<p>\s*<\/p>/g, "")}
  </div>
</div>
