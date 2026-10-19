---
layout: wide
title: AI for Hedge Funds Startup Tracker
description: "A maintained list of startups building AI for hedge funds and other investment firms, with their customers, partners, funding, investors and founders."
image: /assets/images/ai-for-hedge-funds-card.png
suggest_url: https://forms.gle/7xvmKY2EBwYtq3hx8
# Magis's subscribe page, tagged so signups that start on the tracker can be told apart.
subscribe_url: https://magis.substack.com/subscribe?utm_source=alexizydorczyk.com&utm_medium=referral&utm_campaign=ai-hf-tracker
# Rows live in _data/ai_for_hedge_funds.csv; news, customers, partners and founder backgrounds have their own CSVs in _data/.
# The category, focus, status and source_type values are matched against the names below.
legend:
  # description is shown when hovering a category pill.
  category:
    - name: Research Copilot
      emoji: 🧠
      description: "AI assistants and agents for investment research: answers and memos from filings, transcripts, broker research, news and a firm's own documents, plus monitoring and idea generation. Mostly public markets; includes agent platforms deployed inside investment firms."
    - name: Excel Copilot
      emoji: 📊
      description: "AI that builds, updates or manages financial models and Office deliverables (Excel, PowerPoint, Word)."
    - name: Terminal 2.0
      emoji: 🖥️
      description: "AI-native market data terminals and research workspaces, positioned as alternatives to Bloomberg, Capital IQ or FactSet."
    - name: Private Markets & Deals
      emoji: 💼
      description: "Built for private equity, venture capital, private credit, investment banking and fund allocators: deal sourcing, diligence, memos and portfolio monitoring."
    - name: Expert Networks
      emoji: 🗣️
      description: "Expert calls and primary research, including AI-run interviews."
    - name: Data Providers
      emoji: 🗄️
      description: "Sells datasets or data APIs: market data, fundamentals, alternative data and AI-ready financial data."
    - name: Data Extraction
      emoji: ⚙️
      description: "Web scraping and document parsing that turn unstructured sources into structured data for investment teams."
    - name: Quant & Trading
      emoji: 🧮
      description: "Tools for systematic investing and trading: quant research and backtesting, AI-driven strategies and model portfolios for asset managers, trading agents and execution infrastructure."
    - name: Wealth Management
      emoji: 💰
      description: "AI for wealth managers, advisors, private banks and brokerages' client-facing tools."
    - name: Operations & Compliance
      emoji: 🛡️
      description: "Back- and middle-office workflows: operations, compliance and reporting."
    - name: AI Hedge Fund
      emoji: 🤖
      description: "Trades its own or investors' capital with AI (it is the trader, not a vendor), including AI trading labs that trade through a partner firm."
    - name: Stealth
      emoji: 🥷
      description: "Too little public information to tell what the product is."
    - name: Other
      emoji: 🧩
      description: "Doesn't fit the categories above."
  focus:
    - name: Institutional
      description: Built for investment firms, banks and other businesses
    - name: Consumer
      description: Built for individual investors and traders
    - name: Both
      description: Serves both institutions and individual investors
  status:
    - name: Active
      emoji: ✅
      badge: false # don't flag active companies in the table
    - name: Acquired
      emoji: 🤝
    - name: Pivot
      emoji: 🔄
    - name: Inactive
      emoji: 💤
  # Groups for the "Founder background" filter (firm names in the founders_from column).
  # Firms not listed here still appear in the filter, under "Other".
  founder_firms:
    - group: Hedge funds & trading firms
      firms: [AQR, Balyasny, Baupost, Brevan Howard, Bridgewater, Citadel, Citadel Securities, Coatue, D. E. Shaw, Davidson Kempner, DRW, Duquesne Capital, Elliott, Farallon, Five Rings, Hudson River Trading, Jane Street, Jump Trading, King Street, Lone Pine, Man Group, Marshall Wace, Maverick, Millennium, Optiver, Pershing Square, Point72, Renaissance Technologies, Schonfeld, Silver Point Capital, Soros Fund Management, Susquehanna, Third Point, Tiger Global, Tower Research, Tudor, Two Sigma, Viking Global, WorldQuant]
    - group: Banks & investment firms
      firms: [Andreessen Horowitz, Apollo, Bain Capital, Bank of America, Barclays, BlackRock, Blackstone, Capital Group, Carlyle, Centerview, Citi, Credit Suisse, Deutsche Bank, Evercore, Goldman Sachs, Insight Partners, J.P. Morgan, KKR, Lazard, Merrill Lynch, Moelis, Morgan Stanley, PIMCO, PJT, Qatalyst, Sequoia Capital, SoftBank Vision Fund, TPG, UBS, Warburg Pincus]
    - group: Tech companies
      firms: [Airbnb, Anthropic, Coinbase, Databricks, ElevenLabs, Glean, Google Brain, Google DeepMind, Instacart, Meta AI, Notion, OpenAI, Palantir, Plaid, Ramp, Reka AI, Robinhood, Scale AI, Scalapay, Snowflake, SpaceX, Stripe, Tools for Humanity, Uber]
  # Where a customer or partner claim comes from (source_type in the customers/partners CSVs).
  source_type:
    - name: Customer announcement
      label: Announced by the customer
    - name: Partner announcement
      label: Announced by the partner
    - name: News
      label: News coverage
    - name: Press release
      label: Press release
    - name: Case study
      label: Case study
    - name: Company post
      label: Company blog or announcement
    - name: Testimonial
      label: Testimonial on company website
    - name: Logo
      label: Logo on company website
---

# AI for Hedge Funds Startup Tracker

<p class="page-meta"><span>Maintained by Alex Izydorczyk<span class="page-meta-sep" aria-hidden="true">·</span>Updated <span class="tracker-updated">{{ site.time | date: "%b %-d, %Y" }}</span></span> <a class="page-meta-button" href="{{ page.subscribe_url }}" target="_blank" rel="noopener" data-subscribe><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3.5" width="12" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="m2.5 4.5 5.5 4 5.5-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>Subscribe to Magis for updates</a> <a class="page-meta-button" href="{{ page.suggest_url }}">Suggest a company or correction</a></p>

This page tracks startups in the _AI for Hedge Funds_ space. These are startups whose primary customers are alternative asset managers (hedge funds, private equity, venture capital, etc.) and who are using LLMs in a primary capacity. I originally published this on Magis, my blog, [here](https://magis.substack.com/p/genai-for-hedge-funds-startups).
{: .page-intro}

{% include startup-table.html rows=site.data.ai_for_hedge_funds news=site.data.ai_for_hedge_funds_news customers=site.data.ai_for_hedge_funds_customers partners=site.data.ai_for_hedge_funds_partners founders=site.data.ai_for_hedge_funds_founders media=site.data.ai_for_hedge_funds_media %}
