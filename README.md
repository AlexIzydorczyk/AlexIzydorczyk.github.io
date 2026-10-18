Personal website for Alex Izydorczyk

## AI for Hedge Funds tracker

The table on `ai-for-hedge-funds.md` is rendered from five CSVs in `_data/` (any spreadsheet app works).
In the four per-item files, `company` must match the company's name in the main file exactly.

- `ai_for_hedge_funds.csv`: one row per company. Rows are sorted by company automatically.
  - `founders`, `comment`, and `description` accept Markdown links, e.g. `[Jane Doe](https://linkedin.com/in/jane)`.
  - `category`, `focus`, and `status` must match a `name` in the page's `legend` front matter,
    which maps each value to its emoji or label. Unknown values show up as plain text.
  - `focus` is `Institutional`, `Consumer`, or `Both`. The focus filter counts `Both` under each.
  - List columns are separated by semicolons:
    - `fka`: former names, shown under the company name (`Keru; Old Name`).
    - `investors`: institutional investors (`NEA; Y Combinator`).
    - `x_people`: key people's X accounts as `Name @handle` (`Jane Doe @janedoe; John Roe @jroe`).
  - `x_company`: the company's X handle, without the `@`.
  - `founders`: comma-separated names, optionally as Markdown links to LinkedIn (`[Jane Doe](https://linkedin.com/in/jane), John Roe`).
  - `comment` (Notes) is only for status commentary: acquired by whom, why it shut down, what it pivoted to.
  - `description`, `investors`, and X accounts are shown when a row is expanded and are searchable.
  - `company_linkedin` is shown in the expanded row; `founders_linkedin` is kept for reference only.
  - `valuation`, `valuation_basis`, `valuation_date`, `valuation_source`, `valuation_url`: the latest reported
    valuation (e.g. `$7.5B`, `post-money`, `2026-06-03`, `AlphaSense`, link), only for the largest companies
    (roughly Series C and later). Shown under the latest round and in the expanded Funding section; leave blank otherwise.
- `ai_for_hedge_funds_news.csv`: one row per article (`company,date,type,title,source,url,round,amount`).
  - `date` is `YYYY-MM-DD`; `source` is the publisher (defaults to the link's domain).
  - `type` is one of `Funding`, `Customer`, `Partnership`, `Product`, `M&A`, `Rebrand`, `People`,
    `Milestone`, `Profile`, `Shutdown`, `Pivot`. Each type has its own colour.
  - For fundraises, use `Funding` and fill `round` (`Seed`, `Series A`, `Funding` if unknown) and
    `amount` (`$15M`); one post per round, ideally the company's own announcement.
  - Keep one link per event, from the most reputable source: Bloomberg, Reuters, FT, WSJ, The Information
    and similar first, then trade press, newswires and the other party's own announcement, then the
    company's blog. Avoid copies on Yahoo Finance, investing.com and other aggregators.
  - Articles show newest first in the expanded row.
  - The "Total raised" column adds up the `amount` of a company's `Funding` rows, converted to approximate US
    dollars (rough exchange rates in `_includes/tracker-usd.html`; `~` and `+` are ignored). It's a floor:
    a `+` after the total means some rounds have no disclosed amount. Amounts read like `$25M`, `€6.2M`,
    `£2.3M`, `CHF 2M`, `C$3M`, `RMB 100M`, `₩4.6B` or `$500K`.
- `ai_for_hedge_funds_customers.csv`: one row per customer
  (`company,customer,customer_type,source_type,source,url,date`), most notable first.
  - Customers are financial firms that use the product.
  - `source_type` says where the claim comes from: `Customer announcement`, `News`, `Press release`,
    `Case study`, `Company post`, `Testimonial`, or `Logo`.
  - `source` is the publisher or site and `url` is the link. Both appear when a reader clicks the customer.
  - `customer_type` is `Bank`, `Hedge fund`, `Asset manager`, `Private equity`, `Private credit`,
    `Venture capital`, `Pension/Endowment`, `Insurance`, `Broker/Exchange`, or `Other financial`.
- `ai_for_hedge_funds_partners.csv`: one row per key partner
  (`company,partner,partner_type,what,source_type,source,url,date`).
  - Only very significant relationships belong here: data vendors, AI labs, big tech, exchanges.
    Counts: the partner's own announcement, a partner program or launch list it curates (e.g. FactSet's
    AI Partner Program, Claude for Financial Services connectors), a dedicated customer story it published,
    a joint press release, or reputable news. Doesn't count: logos on a partners page, self-serve
    marketplace listings, startup programs, guest posts by the startup on a vendor's blog, or a quote
    inside a broad model-launch post. At most six per company; banks, brokers and funds are customers.
  - `what` is a short description shown next to the partner.
  - `source_type` is `Partner announcement`, `Press release`, `Company post`, `News`, or `Case study`.
  - `partner_type` is `Data & research`, `AI lab`, `Cloud & software`, `Exchange & market infrastructure`,
    `Consulting`, or `Other`.
- Customers and partners can be picked as filters (see "Filters" below): customers grouped by
  `customer_type`, partners by `partner_type` (unknown values go under the last, "Other", group), each kind
  with an "Any … customer/partner" choice. Use the same spelling for a firm across companies
  (`J.P. Morgan`, not `JPMorgan`) so it shows up once.
- `ai_for_hedge_funds_founders.csv`: one row per notable founder background
  (`company,founder,firm,role,years,source`), shown as "ex-Firm" tags. `founder` must match a name in the
  company's `founders` cell exactly. In the expanded row, a tagged founder opens to show the role, years and source.
  - Keep the bar very high: top hedge funds and trading firms, bulge-bracket banks, or breakout companies.
    Substantive roles count even with partial dates; internships and summer stints don't.
  - Founder backgrounds are grouped using `legend.founder_firms` in the page front matter (each group
    also gets an "Any …" choice); a firm missing from that list still appears, under "Other".
- `ai_for_hedge_funds_media.csv`: podcasts, conference talks and videos about a company
  (`company,date,type,title,show,people,url`; `type` is `Podcast`, `Talk` or `Video`; `people` lists notable
  speakers, e.g. a customer on stage with the founder). Shown as a "Media" list in the expanded row, with a
  small count next to the company name.

Category definitions live in the page front matter (`legend.category`) and show when hovering a category.

### Filters

- The search box filters by text as you type and suggests filters: customers, partners, investors and
  founder backgrounds (with how many companies each would leave), plus companies to jump to. Enter or a
  click adds the highlighted one; when the box is empty it shows the most-connected firms of each kind.
- "Browse" opens a panel listing every customer, investor, founder background and partner by kind (in that
  order), with a find box, for when you don't know the name.
- Picked filters show as removable chips under the search box and combine with AND. Clicking an investor
  in an expanded row, or "Show all N companies" in a customer/partner source popover, adds one too.
- Also: the institutional / consumer buttons, the category dropdown, and the status tabs (All, Active,
  Acquired, Pivot, Inactive) above the table.
- The page address follows the filters, search and sort, so any view can be shared, e.g.
  `/ai-for-hedge-funds.html?partner=FactSet&status=Active&sort=raised-desc`. Parameters: `q`, `focus`,
  `status`, `category`, `customer`, `customer-type`, `partner`, `partner-type`, `investor`, `founder`
  (a firm, or `any`), `founder-group`, `sort` (`company|category|founders|round|raised` + `-asc|-desc`).
  "Copy link to this view" copies it; each expanded row has "Copy link" for that company.
- Each row shows counts of news links, named customers and key partners. A green date marks a round
  announced in the 30 days before the site was built ("Updated …" above the table). Companies whose
  favicon is missing get a tile with their initial instead.

Each company has a shareable link, e.g. `/ai-for-hedge-funds.html#hebbia` opens that row.

The numbers beside the intro (companies, active, acquired, documented funding, last updated; above the
intro on narrow screens) are computed from the data when the site builds (`_includes/tracker-stats.html`).
Links to the page show `assets/images/ai-for-hedge-funds-card.png` as their preview image (set by `image:`
in the page front matter); it says "200+ startups", so it only needs redoing if the categories shown on it
change.

## Rest of the site

- `index.md` uses `_layouts/default.html` (the theme's sidebar layout). The tracker card under Projects
  fills in the company count and build date itself. Links to the homepage show
  `assets/images/site-card.png` as their preview image.
- Full-width pages (the tracker and `404.html`) use `_layouts/wide.html`: a slim bar with the name
  (linking home) and Writing / LinkedIn / X, and a footer with a link back home and the disclaimer.
- Site-wide styling lives in `assets/css/custom.css` (the tracker's own styles are in
  `assets/css/tracker.css`). The avatar is `assets/images/sg-profile-320.jpg`, a small copy of
  `sg-profile.png`.
- Google Analytics: `google_analytics` in `_config.yml` is the GA4 measurement ID, and
  `_includes/head-custom-google-analytics.html` (which replaces the theme's old `analytics.js` snippet) loads it.
  It only renders in production builds (GitHub Pages), so local previews don't count as visits.
  Outbound link clicks come from GA4's enhanced measurement (Admin > Data streams > the web stream).

Preview locally with `BUNDLE_PATH=~/.cache/podgorica-bundle bundle exec jekyll serve --livereload -d .context/site`.
