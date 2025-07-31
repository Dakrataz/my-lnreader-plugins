import { fetchApi, fetchText } from '@libs/fetch';
import { Plugin } from '@typings/plugin';
import { Filters, FilterTypes } from '@libs/filterInputs';
import { load as loadCheerio } from 'cheerio';
import { defaultCover } from '@libs/defaultCover';
import { NovelStatus } from '@libs/novelStatus';

/**
 * Plugin for the NoBadNovel web‑site (https://www.nobadnovel.com/).
 */
class NoBadNovel implements Plugin.PluginBase {
  /** Unique identifier used by LNReader. */
  id = 'nobadnovel';

  /** Display name shown in the app. */
  name = 'No Bad Novel';

  /** Path to a 96×96x icon located under icons/src/eng/nobadnovel/icon.png. */
  icon = 'src/en/nobadnovel/icon.png';

  /** Base URL of the site. */
  site = 'https://www.nobadnovel.com';

  /** Semantic version string.  Bump patch/minor/major when updating. */
  version = '1.0.0';

  filters = {
    status: {
      label: 'Status',
      type: FilterTypes.Picker,
      options: [
        { label: 'All', value: '' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Completed', value: 'completed' },
      ],
      value: '',
    },
    sort: {
      label: 'Sort By',
      type: FilterTypes.Picker,
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Updated', value: 'updated' },
      ],
      value: 'published',
    },
    order: {
      label: 'Order',
      type: FilterTypes.Picker,
      options: [
        { label: 'Newest', value: 'newest' },
        { label: 'Oldest', value: 'oldest' },
      ],
      value: 'newest',
    },
  } satisfies Filters;

  /**
   * Build the series list.  The NoBadNovel site currently renders the
   * series list client‑side.  This method fetches the HTML of the
   * browse page and tries to locate links to individual series.  If
   * you find an official API endpoint, replace the fetch URL and
   * parsing logic to use it directly.
   */
  async popularNovels(
    page: number,
    {
      filters,
      showLatestNovels,
    }: Plugin.PopularNovelsOptions<typeof this.filters>,
  ): Promise<Plugin.NovelItem[]> {
    if (page > 1) return [];

    const status = filters?.status?.value ?? '';
    const sort = filters?.sort?.value ?? '';
    const order = filters?.order?.value ?? '';
    // Construct query string.  These parameters are speculative – if
    // NoBadNovel uses different names you will need to adjust them.
    let url = `${this.site}/series?page=${page}`;
    if (status) url += `&status=${status}`;
    if (sort) url += `&sort=${sort}`;
    if (order) url += `&order=${order}`;
    try {
      const resp = await fetchApi(url);
      const html = await resp.text();
      const $ = loadCheerio(html);
      const novels: Plugin.NovelItem[] = [];
      // The site does not pre‑render its list, so this selector may
      // return nothing.  When you find the correct API, adapt the
      // parsing logic accordingly.
      const seen = new Set<string>();
      $('div.aspect-w-3').each((_, card) => {
        const $card = $(card);
        const $link = $card.find('a').first(); // cover link
        const path = $link.attr('href');
        let cover = $link.find('img').attr('src') || defaultCover;

        // the title link is in the next h4 sibling
        const $titleLink = $card.next('h4').find('a').first();
        const name = $titleLink.text().trim();

        if (cover && !cover.startsWith('http')) cover = this.site + cover;

        if (name && path && !seen.has(path)) {
          // ← only push once
          novels.push({ name, path, cover });
          seen.add(path); // ← remember it
        }
      });

      return novels;
    } catch {
      return [];
    }
  }

  /**
   * Parse a single novel page to extract metadata and chapter list.  This
   * method fetches the series page and extracts the title, author,
   * description, cover and chapters.  Because the site renders
   * dynamically, you may need to replace the selectors with ones
   * appropriate for data returned by the API.
   */
  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    const url = this.resolveUrl(novelPath, true);
    const resp = await fetchApi(url);
    const html = await resp.text();
    const $ = loadCheerio(html);

    const novel: Plugin.SourceNovel = {
      path: novelPath,
      name: $('h1').first().text().trim() || 'Unknown title',
      cover: defaultCover,
      author: '',
      status: NovelStatus.Unknown,
      genres: '',
      summary: '',
      chapters: [],
    };

    /* ---------- cover ----------------------------------------------------- */
    const coverSrc = $('main img').first().attr('src');
    if (coverSrc)
      novel.cover = coverSrc.startsWith('http')
        ? coverSrc
        : `${this.site}${coverSrc}`;

    /* ---------- author ---------------------------------------------------- */
    const authorLabel = $('span')
      .filter((_, el) => $(el).text().trim().toLowerCase() === 'author:')
      .first();
    if (authorLabel.length) {
      novel.author = authorLabel.next().text().trim();
    }

    /* ---------- status ---------------------------------------------------- */
    const statusText = $('.badge, .status').first().text().trim().toLowerCase();
    if (statusText.includes('completed') || statusText.includes('finish')) {
      novel.status = NovelStatus.Completed;
    } else if (
      statusText.includes('ongoing') ||
      statusText.includes('updating') ||
      statusText.includes('hot')
    ) {
      novel.status = NovelStatus.Ongoing;
    }

    /* ---------- genres (none on sample page, but keep just in case) ------- */
    const g: string[] = [];
    $('a.genre, .genres a').each((_, el) => {
      const t = $(el).text().trim();
      if (t) g.push(t);
    });
    if (g.length) novel.genres = g.join(', ');

    /* ---------- summary (Description tab) --------------------------------- */
    const descNode = $('#intro .content');
    if (descNode.length) {
      // keep <br> line-breaks
      const raw = descNode
        .html()!
        .replace(/<br\s*\/?>/gi, '\n') // br -> \n
        .replace(/<\/?[^>]*>/g, '') // strip other tags
        .replace(/\n{2,}/g, '\n') // collapse blank lines
        .trim();
      novel.summary = raw;
    }

    /* ---------- chapters --------------------------------------------------- */
    const chapterEls = $('#chapter-list a[href*="/chapter-"]');
    chapterEls.each((idx, el) => {
      const name = $(el).text().trim();
      let href = $(el).attr('href')?.trim() || '';
      if (!href) return;

      // make path site-relative (Plugin.ChapterItem expects just the path)
      if (href.startsWith('http')) {
        try {
          href = new URL(href).pathname;
        } catch {
          /* leave as-is if URL constructor fails */
        }
      }

      // @ts-ignore
      novel.chapters.push({
        name,
        path: href,
        chapterNumber: idx + 1,
        releaseTime: '',
      });
    });

    return novel;
  }

  /**
   * Fetch the chapter text.  This implementation retrieves the HTML of
   * the chapter page and returns the content of a .chapter-content
   * container.  Adjust the selector once you know the actual markup.
   */
  async parseChapter(chapterPath: string): Promise<string> {
    const url = this.resolveUrl(chapterPath);
    const resp = await fetchApi(url);
    const html = await resp.text();
    const $ = loadCheerio(html);

    // 1️⃣  Find the main container (fall back to your old selector if needed)
    let $content = $('div.text-base').first();
    if (!$content.length) {
      $content = $('.chapter-content, .entry-content, article').first();
    }
    if (!$content.length) return '';

    // 2️⃣  Strip ads / scripts / iframes that break the flow
    $content.find('script, ins.adsbygoogle, iframe').remove();

    // 3️⃣  Get rid of empty <p> elements left behind
    $content.find('p').each((_, el) => {
      if (!$(el).text().trim()) $(el).remove();
    });

    // 4️⃣  Return cleaned-up HTML (keep markup for styling)
    return $content.html() ?? '';
  }

  async searchNovels(
    searchTerm: string,
    page: number,
  ): Promise<Plugin.NovelItem[]> {
    if (page > 1) return [];
    const query = encodeURIComponent(searchTerm.trim());
    const url = `${this.site}/series?keyword=${query}&page=${page}`;
    try {
      const resp = await fetchApi(url);
      const html = await resp.text();
      const $ = loadCheerio(html);
      const novels: Plugin.NovelItem[] = [];
      const seen = new Set<string>();
      $('div.aspect-w-3').each((_, card) => {
        const $card = $(card);
        const $link = $card.find('a').first(); // cover link
        const path = $link.attr('href');
        let cover = $link.find('img').attr('src') || defaultCover;

        const $titleLink = $card.next('h4').find('a').first();
        const name = $titleLink.text().trim();

        if (cover && !cover.startsWith('http')) cover = this.site + cover;

        if (name && path && !seen.has(path)) {
          // ← only push once
          novels.push({ name, path, cover });
          seen.add(path); // ← remember it
        }
      });

      return novels;
    } catch {
      return [];
    }
  }

  /**
   * Helper to resolve relative paths.  For novel pages use isNovel=true.
   */
  resolveUrl = (path: string, isNovel?: boolean) => {
    // The website uses /series/slug for novels and /chapter/slug for chapters.
    if (!path.startsWith('http')) {
      if (isNovel)
        return `${this.site}${path.startsWith('/') ? '' : '/'}${path}`;
      return `${this.site}${path.startsWith('/') ? '' : '/'}${path}`;
    }
    return path;
  };
}

export default new NoBadNovel();
