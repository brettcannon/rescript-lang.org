// Generated by ReScript, PLEASE EDIT WITH CARE

import * as Fs from "fs";
import * as Path from "path";
import * as Js_exn from "rescript/lib/es6/js_exn.js";
import * as $$String from "rescript/lib/es6/string.js";
import * as DateStr from "./DateStr.mjs";
import * as Process from "process";
import * as Belt_Array from "rescript/lib/es6/belt_Array.js";
import * as Belt_Option from "rescript/lib/es6/belt_Option.js";
import * as Caml_option from "rescript/lib/es6/caml_option.js";
import GrayMatter from "gray-matter";
import * as BlogFrontmatter from "./BlogFrontmatter.mjs";

function blogPathToSlug(path) {
  return path.replace(/^(archive\/)?\d\d\d\d-\d\d-\d\d-(.+)\.mdx$/, "$2");
}

function getAllPosts(param) {
  var postsDirectory = Path.join(Process.cwd(), "_blogposts");
  var archivedPostsDirectory = Path.join(postsDirectory, "archive");
  var mdxFiles = function (dir) {
    return Fs.readdirSync(dir).filter(function (path) {
                return Path.extname(path) === ".mdx";
              });
  };
  var nonArchivedPosts = mdxFiles(postsDirectory).map(function (path) {
        var match = GrayMatter(Fs.readFileSync(Path.join(postsDirectory, path), "utf8"));
        var msg = BlogFrontmatter.decode(match.data);
        if (msg.TAG === /* Ok */0) {
          return {
                  path: path,
                  archived: false,
                  frontmatter: msg._0
                };
        } else {
          return Js_exn.raiseError(msg._0);
        }
      });
  var archivedPosts = mdxFiles(archivedPostsDirectory).map(function (path) {
        var match = GrayMatter(Fs.readFileSync(Path.join(archivedPostsDirectory, path), "utf8"));
        var msg = BlogFrontmatter.decode(match.data);
        if (msg.TAG === /* Ok */0) {
          return {
                  path: Path.join("archive", path),
                  archived: true,
                  frontmatter: msg._0
                };
        } else {
          return Js_exn.raiseError(msg._0);
        }
      });
  return nonArchivedPosts.concat(archivedPosts).sort(function (a, b) {
              return $$String.compare(Path.basename(b.path), Path.basename(a.path));
            });
}

function dateToUTCString(date) {
  date.setHours(15.0);
  return date.toUTCString();
}

function getLatest(maxOpt, baseUrlOpt, param) {
  var max = maxOpt !== undefined ? maxOpt : 10;
  var baseUrl = baseUrlOpt !== undefined ? baseUrlOpt : "https://rescript-lang.org";
  return getAllPosts(undefined).map(function (post) {
                var fm = post.frontmatter;
                var description = Belt_Option.getWithDefault(Caml_option.null_to_opt(fm.description), "");
                return {
                        title: fm.title,
                        href: baseUrl + "/blog/" + blogPathToSlug(post.path),
                        description: description,
                        pubDate: DateStr.toDate(fm.date)
                      };
              }).slice(0, max);
}

function toXmlString(siteTitleOpt, siteDescriptionOpt, items) {
  var siteTitle = siteTitleOpt !== undefined ? siteTitleOpt : "ReScript Blog";
  var siteDescription = siteDescriptionOpt !== undefined ? siteDescriptionOpt : "";
  var latestPubDateElement = Belt_Option.getWithDefault(Belt_Option.map(Belt_Array.get(items, 0), (function (item) {
              var latestPubDateStr = dateToUTCString(item.pubDate);
              return "<lastBuildDate>" + latestPubDateStr + "</lastBuildDate>";
            })), "");
  var itemsStr = items.map(function (param) {
          var description = param.description;
          var href = param.href;
          var descriptionElement = description === "" ? "" : "<description>\n            <![CDATA[" + description + "]]>\n          </description>";
          var dateStr = dateToUTCString(param.pubDate);
          return "\n        <item>\n          <title> <![CDATA[" + param.title + "]]></title>\n          <link> " + href + " </link>\n          <guid> " + href + " </guid>\n          " + descriptionElement + "\n          <pubDate>" + dateStr + "</pubDate>\n        </item>";
        }).join("\n");
  return "<?xml version=\"1.0\" encoding=\"utf-8\" ?>\n  <rss version=\"2.0\">\n    <channel>\n      <title>" + siteTitle + "</title>\n      <link>https://rescript-lang.org</link>\n      <description>" + siteDescription + "</description>\n      <language>en</language>\n      " + latestPubDateElement + "\n" + itemsStr + "\n    </channel>\n  </rss>";
}

var RssFeed = {
  getLatest: getLatest,
  toXmlString: toXmlString
};

export {
  getAllPosts ,
  blogPathToSlug ,
  RssFeed ,
  
}
/* fs Not a pure module */