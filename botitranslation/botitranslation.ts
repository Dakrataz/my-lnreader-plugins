import { fetchApi } from '@libs/fetch';
import { Plugin } from '@/types/plugin';
import { Filters, FilterTypes } from '@libs/filterInputs';
import { NovelStatus } from '@libs/novelStatus';
import { encode } from 'urlencode';

class BotiTranslation implements Plugin.PluginBase {
  id = 'botitranslation';
  name = 'Boti Translation';
  icon = 'src/en/botitranslation/icon.png';
  site = 'www.botitranslation.com';
  version = '1.0.0';

  filters: Filters | undefined = {
    type: {
      label: "Category",
      options: [
        { label: "All", value: "" },
        { label: "Original", value: "original" },
        { label: "Translation", value: "translation" },
      ],
      type: FilterTypes.Picker,
      value: "",
    },
    genre: {
      label: "Genre",
      options: [
        { label: "All", value: "" },
        { label: "Fantasy", value: "1" },
        { label: "Sci-fi", value: "2" },
        { label: "Sports", value: "3" },
        { label: "Urban", value: "4" },
        { label: "Eastern Fantasy", value: "5" },
        { label: "Horror&Thriller", value: "6" },
        { label: "Video Game", value: "7" },
        { label: "History", value: "8" },
        { label: "War", value: "9" },
        { label: "Urban Romance", value: "10" },
        { label: "Fantasy Romance", value: "11" },
        { label: "Historical Romance", value: "12" },
        { label: "Teen", value: "13" },
        { label: "LGBT+", value: "14" },
        { label: "OTHERS+", value: "16" },
      ],
      type: FilterTypes.Picker,
      value: "",
    },
    withinDay: {
      label: "Last Update",
      options: [
        { label: "All", value: "" },
        { label: "Within 3 Days", value: "3" },
        { label: "Within 7 Days", value: "7" },
        { label: "Within 15 Days", value: "15" },
        { label: "Within 30 Days", value: "30" },
      ],
      type: FilterTypes.Picker,
      value: "",
    },
    status: {
      label: "Status",
      options: [
        { label: "All", value: "" },
        { label: NovelStatus.Ongoing, value: "0" },
        { label: NovelStatus.Completed, value: "1" },
      ],
      type: FilterTypes.Picker,
      value: "",
    },
  };

  headers = {
    'lang': 'en_US',
    'site-domain': 'www.botitranslation.com',
    'Origin': 'https://www.botitranslation.com',
    'Referer': 'https://www.botitranslation.com/',
  };

  imageRequestInit?: Plugin.ImageRequestInit | undefined = undefined;

  //flag indicates whether access to LocalStorage, SesesionStorage is required.
  webStorageUtilized?: boolean;

  async popularNovels(
    pageNo: number,
    {
      showLatestNovels,
      filters,
    }: Plugin.PopularNovelsOptions<typeof this.filters>,
  ): Promise<Plugin.NovelItem[]> {

    console.log(filters)

    const novels: Plugin.NovelItem[] = [];

    const pageSize = 20;
    const baseUrl = "https://api.mystorywave.com/story-wave-backend/api/v1/content/books";

    const params = new URLSearchParams({
      pageNumber: pageNo.toString(),
      pageSize: pageSize.toString(),
    });

    if (filters) {
      if (filters.type.value) {
        params.append('type', (filters.type.value as string));
      }
      if (filters.genre.value) {
        params.append('genre', (filters.genre.value as string));
      }
      if (filters.withinDay.value) {
        params.append('withinDay', (filters.withinDay.value as string));
      }
      if (filters.status.value) {
        params.append('status', (filters.status.value as string));
      }
    }

    const url = `${baseUrl}?${params.toString()}`;

    const response = await fetchApi(url, { headers: this.headers });
    const json = await response.json();

    const novelList = json.data.list || [];

    for(const novel of novelList){
      novels.push({
        name: novel.title,
        path: novel.id.toString(),
        cover: novel.coverImgUrl
      })
    }

    return novels;
  }
  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {

    const bookResponse = await fetchApi('https://api.mystorywave.com/story-wave-backend/api/v1/content/books/' + novelPath, { headers: this.headers });
    const bookJson = await bookResponse.json();
    const bookData = bookJson.data;

    let status: typeof NovelStatus[keyof typeof NovelStatus];
    switch (bookData.status) {
      case 0:
        status = NovelStatus.Ongoing;
        break;
      case 1:
        status = NovelStatus.Completed;
        break;
      default:
        status = NovelStatus.Unknown;
        break;
    }

    const novel: Plugin.SourceNovel = {
      path: novelPath,
      name: bookData.title,
      author: bookData.authorPseudonym,
      cover: bookData.coverImgUrl,
      genres: bookData.genreName,
      status: status,
      summary: bookData.synopsis,
    };

    const chapters: Plugin.ChapterItem[] = [];

    let stillHaveChapters = true;
    let pageNumber = 1;

    while(stillHaveChapters){
      const chapterResponse = await fetchApi(`https://api.mystorywave.com/story-wave-backend/api/v1/content/chapters/page?sortDirection=ASC&bookId=${novelPath}&pageNumber=${pageNumber}&pageSize=100`, { headers: this.headers });
      const chapterJson = await chapterResponse.json();
      const chapterList = chapterJson.data.list || [];

      if(chapterList.length === 0){
        stillHaveChapters = false;
        break;
      }

        for(const chap of chapterList){
          chapters.push({
            name: chap.title,
            path: chap.id.toString(),
            releaseTime: chap.createTime,
            chapterNumber: chap.chapterOrder,
          })
        }
        pageNumber++;
    }

    novel.chapters = chapters;
    return novel;
  }
  async parseChapter(chapterPath: string): Promise<string> {

    const chapterResponse = await fetchApi('https://api.mystorywave.com/story-wave-backend/api/v1/content/chapters/' + chapterPath, { headers: this.headers });
    const chapterJson = await chapterResponse.json();

    const chapterText = chapterJson.data.content || "";
    return chapterText;
  }
  async searchNovels(
    searchTerm: string,
    pageNo: number,
  ): Promise<Plugin.NovelItem[]> {
    const novels: Plugin.NovelItem[] = [];

    const url = `https://api.mystorywave.com/story-wave-backend/api/v1/content/books/search?keyWord=${encode(searchTerm)}&pageNumber=${pageNo}&pageSize=50`

    const response = await fetchApi(url, { headers: this.headers });
    const json = await response.json();

    const novelList = json.data.list || [];

    for(const novel of novelList){
      novels.push({
        name: novel.title,
        cover: novel.coverImgUrl,
        path: novel.id.toString(),
      })
    }

    return novels;
  }

  resolveUrl = (path: string, isNovel?: boolean) =>
    this.site + (isNovel ? '/book/' : '/chapter/') + path;
}

export default new BotiTranslation();