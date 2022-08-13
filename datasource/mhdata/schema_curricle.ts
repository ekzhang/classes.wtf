
type EmptyString = string; // "", " ", etc
type XMLString = string; // starts with "<?xml"
type HTMLString = string; // includes "</"
type URLString = string; // starts with "http" and is a valid URL
type TimeString = string; // hh:mm(am | pm)
type LongString<T> = string; // used in place of actual string in an enum when the string is too long

export type Course = {
  academicGroup: ("FAS" | "GSAS" | "BRN" | "FLT"),
  academicYear: (2019 | 2020 | 2021 | 2030 | 2022 | 2023),

  /* e.g. "210A" */
  catalogNumber: string,

  /* e.g. "001" */
  classSection: string,

  /* e.g. "Seminar" */
  component: string,

  /* e.g. "Seminar" */
  componentFiltered: string,

  /* e.g. "Reading Scholarly Japanese" */
  courseDescription: string | null,
  courseDescriptionLong: HTMLString | (LongString<string>) | EmptyString,
  courseInstructors: ({

    /* e.g. "Wesley Jacobsen" */
    displayName: string | EmptyString,

    /* e.g. "JACOBSEN@FAS.HARVARD.EDU" */
    email: string | null,

    /* e.g. "Wesley" */
    firstName: string | null,

    /* e.g. "4416602" */
    id: string,
    instructorRole: ("HEAD" | "INST" | "PI"),

    /* e.g. "Jacobsen" */
    lastName: string | null,

    /* e.g. "Mark" */
    middleName: string | EmptyString | null,
  } | undefined)[],
  courseLevel: ("PRIMGRAD" | "PRIMUGRD" | "UGRDGRAD" | "NOLEVEL"),
  courseMeetingPatterns: ({

    /* e.g. "2018-12-05" */
    endDate: string,

    /* e.g. "3054023" */
    id: string,

    /* e.g. "10:15" */
    meetingTimeEndTod: string | null,

    /* e.g. "09:00" */
    meetingTimeStartTod: string | null,
    meetsOnFriday: boolean,
    meetsOnMonday: boolean,
    meetsOnSaturday: boolean,
    meetsOnSunday: boolean,
    meetsOnThursday: boolean,
    meetsOnTuesday: boolean,
    meetsOnWednesday: boolean,

    /* e.g. "2018-09-04" */
    startDate: string,
  } | undefined)[],
  externalCourseId: number,

  /* e.g. "162368" */
  id: string,
  qGuideCourseId: number | null,
  semester: ("Fall 2018" | "Spring 2019" | "Summer 2019" | "Spring 2020" | "Fall 2019" | "Spring 2021" | "Fall 2020" | "Summer 2020" | "Fall 2029" | "Fall 2021" | "Spring 2022" | "Summer 2021" | "Fall 2022" | "Spring 2023"),

  /* e.g. "JAPAN" */
  subject: string,

  /* e.g. "Japanese" */
  subjectDescription: string,
  termCode: (2188 | 2192 | 2196 | 2202 | 2198 | 2212 | 2208 | 2206 | 2298 | 2218 | 2222 | 2216 | 2228 | 2232),

  /* e.g. "Reading Scholarly Japanese for Students of Chinese and Korean" */
  title: string | null | HTMLString,
  unitsMaximum: (4 | 0 | 8 | 16 | 2 | 12),
};
