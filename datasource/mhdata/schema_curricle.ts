
type EmptyString = string; // "", " ", etc
type XMLString = string; // starts with "<?xml"
type HTMLString = string; // includes "</"
type URLString = string;
type TimeString = string; // hh:mm(am | pm)

export type Course = {

  /* e.g. "FAS" */
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

  /* e.g. "Part one of a two part introductory course in modern Czech language and culture, designed for students without previous knowledge who would like to speak Czech or use the language for reading and research. All four major communicative skills (speaking, listening comprehension, reading, writing) are stressed. Students are exposed to Czech culture through work with film and literature and gain some familiarity with the major differences between literary and spoken Czech as they learn to use the language both as a means of communication and as a tool for reading and research. Czech AA: Elementary Czech I (in the fall) and Czech AB: Elementary Czech II (in the spring) satisfy the foreign language requirement and prepare students for continued study of Czech in intermediate-level courses and for study or travel abroad in the Czech Republic." */
  courseDescriptionLong: HTMLString | ("Part one of a two part intr... (string of length 847)" | "Analyses the libertarian pe... (string of length 353)" | "Individualized study of the... (string of length 193)" | "Examines the Spanish Civil ... (string of length 417)" | "Punishing people for their ... (string of length 792)" | "Individualized study of the... (string of length 136)" | "Part one of a two part intr... (string of length 751)" | "The course investigates the... (string of length 655)" | "Major movements in German l... (string of length 300)" | "An intensive version of Rus... (string of length 296)" | "From the seventeenth centur... (string of length 1586)" | "Part one of a two part intr... (string of length 856)" | "An exploration of how anima... (string of length 345)" | "Any organization, business ... (string of length 1529)") | EmptyString,
  courseInstructors: {

    /* e.g. "Wesley Jacobsen" */
    displayName: string | EmptyString,

    /* e.g. "JACOBSEN@FAS.HARVARD.EDU" */
    email: string | null,

    /* e.g. "Wesley" */
    firstName: string | null,

    /* e.g. "4416602" */
    id: string,

    /* e.g. "HEAD" */
    instructorRole: ("HEAD" | "INST" | "PI"),

    /* e.g. "Jacobsen" */
    lastName: string | null,

    /* e.g. "Mark" */
    middleName: string | EmptyString | null,
  }[],

  /* e.g. "PRIMGRAD" */
  courseLevel: ("PRIMGRAD" | "PRIMUGRD" | "UGRDGRAD" | "NOLEVEL"),
  courseMeetingPatterns: {

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
  }[],
  externalCourseId: number,

  /* e.g. "162368" */
  id: string,
  qGuideCourseId: number | null,

  /* e.g. "Fall 2018" */
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
