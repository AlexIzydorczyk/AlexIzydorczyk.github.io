---
layout: wide
title: How Hedge Funds Use AI
description: "A library of podcasts, talks and technical posts in which the largest hedge funds and trading firms describe how they use LLMs and AI agents."
suggest_url: https://forms.gle/7xvmKY2EBwYtq3hx8
# Magis's subscribe page, tagged so signups that start on this page can be told apart.
subscribe_url: https://magis.substack.com/subscribe?utm_source=alexizydorczyk.com&utm_medium=referral&utm_campaign=ai-hf-library
# Funds live in _data/ai_at_hedge_funds.csv and their library in _data/ai_at_hedge_funds_library.csv.
# The strategy and type values are matched against the names below.
legend:
  # description is shown when hovering a strategy.
  strategy:
    - name: Multi-strategy
      emoji: 🏛️
      description: "Multi-manager and multi-strategy platforms: many teams across equities, credit, macro and quant under one risk framework."
    - name: Quant
      emoji: 🧮
      description: "Systematic investment managers whose trading is driven mainly by models."
    - name: Macro
      emoji: 🌍
      description: "Discretionary and systematic global macro: rates, currencies, commodities and indices."
    - name: Fundamental equity
      emoji: 🔍
      description: "Fundamental stock pickers: long/short equity, Tiger cubs, activists and value investors."
    - name: Credit & event-driven
      emoji: 📜
      description: "Distressed and performing credit, special situations and event-driven investing."
    - name: Trading firm
      emoji: ⚡
      description: "Proprietary trading and market-making firms that trade their own capital rather than outside investors' money."
  # Library formats (type in the library CSV). icon is the inside of a 16x16 SVG.
  format:
    - name: Podcast
      plural: Podcasts
      description: "Podcast episodes with a substantial segment on the firm's AI work"
      icon: '<path d="M8 2.25a2 2 0 0 0-2 2V8a2 2 0 0 0 4 0V4.25a2 2 0 0 0-2-2zM4.25 7.5a3.75 3.75 0 0 0 7.5 0M8 11.25v2.5M6 13.75h4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>'
    - name: Talk
      plural: Talks
      description: "Recorded conference talks, panels and firesides"
      icon: '<rect x="2.25" y="2.75" width="11.5" height="7.5" rx="1.25" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M8 10.25v3M5.5 13.25h5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>'
    - name: Video
      plural: Videos
      description: "TV interviews and other videos about the firm's AI work"
      icon: '<rect x="2" y="3.5" width="12" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M6.9 6.1v3.8L10 8z" fill="currentColor"/>'
    - name: Article
      plural: Articles
      description: "The firm's own blog posts, papers and research notes with technical detail"
      icon: '<path d="M4 2.25h5.25l2.75 2.75v8.75H4zM9.25 2.25V5H12M6.25 8h3.5M6.25 10.75h3.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>'
    - name: Case study
      plural: Case studies
      description: "Posts published with a vendor (OpenAI, Anthropic, AWS and others) about the firm's implementation"
      icon: '<path d="M6.5 9.5 9.5 6.5M7 4.5l1.3-1.3a2.6 2.6 0 0 1 3.6 3.6L10.5 8.2M9 11.5l-1.3 1.3a2.6 2.6 0 0 1-3.6-3.6L5.5 7.8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>'
    - name: Interview
      plural: Interviews
      description: "Written press interviews in which firm leaders describe the AI work in detail"
      icon: '<path d="M6.5 3.75C4.6 4.4 3.25 6 3.25 8.4v3.85h3.5V8.75H4.9M12.75 3.75c-1.9.65-3.25 2.25-3.25 4.65v3.85H13V8.75h-1.85" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>'
---

# How Hedge Funds Use AI

<p class="page-meta"><span>Maintained by Alex Izydorczyk<span class="page-meta-sep" aria-hidden="true">·</span>Updated <span class="tracker-updated">{{ site.time | date: "%b %-d, %Y" }}</span></span> <a class="page-meta-button" href="{{ page.subscribe_url }}" target="_blank" rel="noopener" data-subscribe><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3.5" width="12" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="m2.5 4.5 5.5 4 5.5-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>Subscribe to Magis for updates</a> <a class="page-meta-button" href="{{ page.suggest_url }}">Suggest a talk, podcast or post</a></p>

This page is a library of what the largest hedge funds and trading firms have said in public about how they use LLMs and AI agents: podcasts, recorded talks, and technical posts, including case studies written with their AI vendors. Every item features the firm's own people talking about AI inside the firm, not AI as an investment theme. For the startups selling AI to these firms, see the [AI for Hedge Funds Startup Tracker]({% link ai-for-hedge-funds.md %}).
{: .page-intro}

{% include fund-library.html funds=site.data.ai_at_hedge_funds items=site.data.ai_at_hedge_funds_library %}
