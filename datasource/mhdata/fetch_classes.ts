import fetch from "node-fetch";
import * as fs from "fs";
import cliProgress from 'cli-progress';

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

type Course = {
  Key: string,
  [key: string]: any,
}

type ResultsProperties = {
  ResultsCollection: Course[]
}
type FacetsProperties = {
  Facets: any[]
}
type SearchPropertiesProperties = {
  HitCount: number,
  DocumentCount: number,
  PageSize: number,
  PageNumber: number,
  TotalPages: number,
  ResultStart: number,
  ResultEnd: number,
  SearchText: string,
  FacetsCount: number,
  SearchQuery: string,
  SearchTextOriginal: string,
  BoostEnabled: boolean,
  BoostMode: string,
  BoostScoreMode: string,
  BoostExcludeNonBoosted: string,
}
type MHResponseRaw = (
  ({ Key: 'Results' } & ResultsProperties) |
  ({ Key: 'Facets' } & FacetsProperties) |
  ({ Key: 'SearchProperties' } & SearchPropertiesProperties)
  )[]
type MHResponse = {
  Results: ResultsProperties,
  Facets: FacetsProperties,
  SearchProperties: SearchPropertiesProperties
}

type CourseFetchProgressObject = {
  term: string;
  done: number[];
  errors: number[];
  courses: { [Key: string]: Course };
  pagesToGet: number[];
  totalPages: number;
  totalCourses: number;
}

class CourseFetchProgress {

  term: string;
  done: number[] = [];
  errors: number[] = [];
  courses: { [Key: string]: Course } = {};
  pagesToGet: number[] = [];
  totalPages: number = 0;
  totalCourses: number = 0;

  constructor(term: string) {
    this.term = term;
  }

  toObject() : CourseFetchProgressObject {
    return {
      term: this.term,
      done: this.done,
      errors: this.errors,
      courses: this.courses,
      pagesToGet: this.pagesToGet,
      totalPages: this.totalPages,
      totalCourses: this.totalCourses,
    };
  }

  static fromObject(obj: CourseFetchProgressObject) {
    let cfp = new CourseFetchProgress(obj.term);
    cfp.done = obj.done;
    cfp.errors = obj.errors;
    cfp.courses = obj.courses;
    cfp.pagesToGet = obj.pagesToGet;
    cfp.totalPages = obj.totalPages;
    cfp.totalCourses = obj.totalCourses;
    return cfp;
  }

  async save() {
    try {
      let text = JSON.stringify(this.toObject(), null, 2);
      await fs.promises.writeFile(`../data/courses_${this.term.replace(/ /g, "_")}.json`, text, "utf8");
    } catch (e) {
      console.log(`Error saving ${this.term}`, e);
    }
  }

  static async load(term: string): Promise<CourseFetchProgress> {
    let path = `../data/courses_${term.replace(/ /g, "_")}.json`;
    let text = await fs.promises.readFile(path, "utf8"); // todo: handle errors
    return CourseFetchProgress.fromObject(JSON.parse(text));
  }

  updateWithPage(page: MHResponse) {
    const pageNumber = page.SearchProperties.PageNumber;
    this.done.push(pageNumber);
    page.Results.ResultsCollection.forEach(course => {
      this.courses[course.Key] = course;
    });
    this.pagesToGet = this.pagesToGet.filter(p => p !== pageNumber);
  }

  updateWithError(pageNumber: number) {
    this.errors.push(pageNumber);
  }
}

async function getPage(query?: {
  pageNumber?: number,
  searchText?: string,
  pageSize?: number,
  term?: string,
}): Promise<MHResponse> {
  const response = await fetch("https://courses.my.harvard.edu/psc/courses/EMPLOYEE/EMPL/s/WEBLIB_IS_SCL.ISCRIPT1.FieldFormula.IScript_Search", {
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    method: "POST",
    body: "SearchReqJSON=" + encodeURIComponent(JSON.stringify({
      "ExcludeBracketed": true,
      "PageNumber": query?.pageNumber ?? 1,
      "PageSize": `${query?.pageSize ?? ''}`,
      "SortOrder": [
        "IS_SCL_SUBJ_CAT"
      ],
      "Facets": [
        `IS_SCL_DESCR_IS_SCL_DESCRH:${query?.term ?? "2022 Fall"}:Term`,
        "IS_SCL_DESCR_IS_SCL_DESCRI:Faculty of Arts %26 Sciences:School" // only include FAS courses -- may want to get others later
      ],
      "Category": "HU_SCL_SCHEDULED_BRACKETED_COURSES",
      "SearchPropertiesInResults": true,
      "FacetsInResults": true,
      "SaveRecent": true,
      "TopN": "",
      "SearchText": query?.searchText ?? "*",
      "DeepLink": false,
    })),
  });
  const text = await response.text();
  if (text.length < 1000) console.log(`Possible error fetching page for query ${JSON.stringify(query)}`, text);
  const json: MHResponseRaw = JSON.parse(text);
  return {
    Results: <ResultsProperties>json.find(o => o.Key === "Results"),
    Facets: <FacetsProperties>json.find(o => o.Key === "Facets"),
    SearchProperties: <SearchPropertiesProperties>json.find(o => o.Key === "SearchProperties"),
  }
}

let pageFetcher = async (delay: number, cfp: CourseFetchProgress, progressBar: any) => {
  await sleep(delay);

  while (cfp.pagesToGet.length) {
    let pageToGet = cfp.pagesToGet.shift()!;
    try {
      let page = await getPage({term: cfp.term, pageNumber: pageToGet});
      cfp.updateWithPage(page);
      progressBar.update(cfp.done.length);
      await cfp.save();
    } catch (e) {
      console.log("Error getting page:", pageToGet, e);
      cfp.updateWithError(pageToGet);
    }
  }
};

async function getCoursesForTerm(term: string): Promise<CourseFetchProgress> {
  // read in existing progress file if it exists
  let progress: CourseFetchProgress;
  try {
    progress = await CourseFetchProgress.load(term);
    console.log(`Loaded from existing file, ${progress.pagesToGet.length} pages left`);
  } catch (e) {
    console.log(`No existing file for ${term}, started from scratch.`);
    progress = new CourseFetchProgress(term);
    let p1 = await getPage({term, pageNumber: 1});
    progress.totalPages = p1.SearchProperties.TotalPages;
    progress.totalCourses = p1.SearchProperties.HitCount;
    progress.pagesToGet = Array(progress.totalPages).fill(1).map((_, idx) => idx + 1); // [1, T] inclusive
    progress.updateWithPage(p1);
  }
  console.log(`Beginning scrape of ${term}. ${progress.done.length}/${progress.totalPages} pages, ${Object.keys(progress.courses).length}/${progress.totalCourses} courses`);

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.legacy);
  progressBar.start(progress.totalPages, progress.done.length);

  // run multiple page fetchers in parallel
  await Promise.all([
    pageFetcher(0, progress, progressBar),
    pageFetcher(100, progress, progressBar),
    pageFetcher(200, progress, progressBar),
    pageFetcher(300, progress, progressBar),
    pageFetcher(400, progress, progressBar),
    pageFetcher(500, progress, progressBar),
    pageFetcher(600, progress, progressBar),
    pageFetcher(700, progress, progressBar),
  ]);

  // finished
  console.log(`\n ${term} COMPLETE, saving. ${progress.done.length}/${progress.totalPages} pages`);
  await progress.save();
  progressBar.stop();
  console.log(" Done:", progress.done);
  console.log(" Errs:", progress.errors);

  return progress;
}

(async () => {
  console.log("Starting up...");
  await getCoursesForTerm("2022 Fall");
})();
