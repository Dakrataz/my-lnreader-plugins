"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fetch_1 = require("@libs/fetch");
var filterInputs_1 = require("@libs/filterInputs");
var novelStatus_1 = require("@libs/novelStatus");
var urlencode_1 = require("urlencode");
var BotiTranslation = /** @class */ (function () {
    function BotiTranslation() {
        var _this = this;
        this.id = 'botitranslation';
        this.name = 'Boti Translation';
        this.icon = 'src/en/botitranslation/icon.png';
        this.site = 'www.botitranslation.com';
        this.version = '1.0.0';
        this.filters = {
            type: {
                label: "Category",
                options: [
                    { label: "All", value: "" },
                    { label: "Original", value: "original" },
                    { label: "Translation", value: "translation" },
                ],
                type: filterInputs_1.FilterTypes.Picker,
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
                type: filterInputs_1.FilterTypes.Picker,
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
                type: filterInputs_1.FilterTypes.Picker,
                value: "",
            },
            status: {
                label: "Status",
                options: [
                    { label: "All", value: "" },
                    { label: novelStatus_1.NovelStatus.Ongoing, value: "0" },
                    { label: novelStatus_1.NovelStatus.Completed, value: "1" },
                ],
                type: filterInputs_1.FilterTypes.Picker,
                value: "",
            },
        };
        this.headers = {
            'lang': 'en_US',
            'site-domain': 'www.botitranslation.com',
            'Origin': 'https://www.botitranslation.com',
            'Referer': 'https://www.botitranslation.com/',
        };
        this.imageRequestInit = undefined;
        this.resolveUrl = function (path, isNovel) {
            return _this.site + (isNovel ? '/book/' : '/chapter/') + path;
        };
    }
    BotiTranslation.prototype.popularNovels = function (pageNo_1, _a) {
        return __awaiter(this, arguments, void 0, function (pageNo, _b) {
            var novels, pageSize, baseUrl, params, url, response, json, novelList, _i, novelList_1, novel;
            var showLatestNovels = _b.showLatestNovels, filters = _b.filters;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log(filters);
                        novels = [];
                        pageSize = 20;
                        baseUrl = "https://api.mystorywave.com/story-wave-backend/api/v1/content/books";
                        params = new URLSearchParams({
                            pageNumber: pageNo.toString(),
                            pageSize: pageSize.toString(),
                        });
                        if (filters) {
                            if (filters.type.value) {
                                params.append('type', filters.type.value);
                            }
                            if (filters.genre.value) {
                                params.append('genre', filters.genre.value);
                            }
                            if (filters.withinDay.value) {
                                params.append('withinDay', filters.withinDay.value);
                            }
                            if (filters.status.value) {
                                params.append('status', filters.status.value);
                            }
                        }
                        url = "".concat(baseUrl, "?").concat(params.toString());
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(url, { headers: this.headers })];
                    case 1:
                        response = _c.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        json = _c.sent();
                        novelList = json.data.list || [];
                        for (_i = 0, novelList_1 = novelList; _i < novelList_1.length; _i++) {
                            novel = novelList_1[_i];
                            novels.push({
                                name: novel.title,
                                path: novel.id.toString(),
                                cover: novel.coverImgUrl
                            });
                        }
                        return [2 /*return*/, novels];
                }
            });
        });
    };
    BotiTranslation.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var bookResponse, bookJson, bookData, status, novel, chapters, stillHaveChapters, pageNumber, chapterResponse, chapterJson, chapterList, _i, chapterList_1, chap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)('https://api.mystorywave.com/story-wave-backend/api/v1/content/books/' + novelPath, { headers: this.headers })];
                    case 1:
                        bookResponse = _a.sent();
                        return [4 /*yield*/, bookResponse.json()];
                    case 2:
                        bookJson = _a.sent();
                        bookData = bookJson.data;
                        switch (bookData.status) {
                            case 0:
                                status = novelStatus_1.NovelStatus.Ongoing;
                                break;
                            case 1:
                                status = novelStatus_1.NovelStatus.Completed;
                                break;
                            default:
                                status = novelStatus_1.NovelStatus.Unknown;
                                break;
                        }
                        novel = {
                            path: novelPath,
                            name: bookData.title,
                            author: bookData.authorPseudonym,
                            cover: bookData.coverImgUrl,
                            genres: bookData.genreName,
                            status: status,
                            summary: bookData.synopsis,
                        };
                        chapters = [];
                        stillHaveChapters = true;
                        pageNumber = 1;
                        _a.label = 3;
                    case 3:
                        if (!stillHaveChapters) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, fetch_1.fetchApi)("https://api.mystorywave.com/story-wave-backend/api/v1/content/chapters/page?sortDirection=ASC&bookId=".concat(novelPath, "&pageNumber=").concat(pageNumber, "&pageSize=100"), { headers: this.headers })];
                    case 4:
                        chapterResponse = _a.sent();
                        return [4 /*yield*/, chapterResponse.json()];
                    case 5:
                        chapterJson = _a.sent();
                        chapterList = chapterJson.data.list || [];
                        if (chapterList.length === 0) {
                            stillHaveChapters = false;
                            return [3 /*break*/, 6];
                        }
                        for (_i = 0, chapterList_1 = chapterList; _i < chapterList_1.length; _i++) {
                            chap = chapterList_1[_i];
                            chapters.push({
                                name: chap.title,
                                path: chap.id.toString(),
                                releaseTime: chap.createTime,
                                chapterNumber: chap.chapterOrder,
                            });
                        }
                        pageNumber++;
                        return [3 /*break*/, 3];
                    case 6:
                        novel.chapters = chapters;
                        return [2 /*return*/, novel];
                }
            });
        });
    };
    BotiTranslation.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var chapterResponse, chapterJson, chapterText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)('https://api.mystorywave.com/story-wave-backend/api/v1/content/chapters/' + chapterPath, { headers: this.headers })];
                    case 1:
                        chapterResponse = _a.sent();
                        return [4 /*yield*/, chapterResponse.json()];
                    case 2:
                        chapterJson = _a.sent();
                        chapterText = chapterJson.data.content || "";
                        return [2 /*return*/, chapterText];
                }
            });
        });
    };
    BotiTranslation.prototype.searchNovels = function (searchTerm, pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            var novels, url, response, json, novelList, _i, novelList_2, novel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        novels = [];
                        url = "https://api.mystorywave.com/story-wave-backend/api/v1/content/books/search?keyWord=".concat((0, urlencode_1.encode)(searchTerm), "&pageNumber=").concat(pageNo, "&pageSize=50");
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(url, { headers: this.headers })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        json = _a.sent();
                        novelList = json.data.list || [];
                        for (_i = 0, novelList_2 = novelList; _i < novelList_2.length; _i++) {
                            novel = novelList_2[_i];
                            novels.push({
                                name: novel.title,
                                cover: novel.coverImgUrl,
                                path: novel.id.toString(),
                            });
                        }
                        return [2 /*return*/, novels];
                }
            });
        });
    };
    return BotiTranslation;
}());
exports.default = new BotiTranslation();
