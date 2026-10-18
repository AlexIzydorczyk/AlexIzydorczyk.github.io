// Search, filters, sorting, expandable rows and source popovers for _includes/startup-table.html.
// The table is fully rendered by Jekyll; this only adds interactivity.
// Filters: focus (institutional / consumer), status tabs, category, free-text search, and "picks": customers,
// partners, investors and founder backgrounds chosen from the search box's suggestions or the Browse panel.
// Picks show as removable chips and combine with AND.
(function () {
  var dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

  document.querySelectorAll('[data-tracker]').forEach(function (tracker) {
    var table = tracker.querySelector('table');
    var groups = Array.prototype.slice.call(table.tBodies);
    var toolbar = tracker.querySelector('[data-tracker-toolbar]');
    var search = tracker.querySelector('[data-tracker-search]');
    var omni = toolbar.querySelector('[data-tracker-omni]');
    var suggest = toolbar.querySelector('[data-tracker-suggest]');
    var browseButton = toolbar.querySelector('[data-tracker-browse]');
    var explorer = toolbar.querySelector('[data-tracker-explorer]');
    var picksRow = toolbar.querySelector('[data-tracker-picks]');
    var categorySelect = toolbar.querySelector('[data-tracker-category]');
    var clearButton = tracker.querySelector('[data-tracker-clear]');
    var shareButton = tracker.querySelector('[data-tracker-share]');
    var fab = tracker.querySelector('[data-tracker-fab]');
    var count = tracker.querySelector('[data-tracker-count]');
    var empty = tracker.querySelector('[data-tracker-empty]');
    var focusButtons = toolbar.querySelectorAll('button[data-focus]');
    var statusButtons = tracker.querySelectorAll('[data-tracker-meta] button[data-status]');
    var sortButtons = tracker.querySelectorAll('th button[data-sort]');
    var activeFocus = '*';
    var activeStatus = '*';
    var picks = []; // [{ kind, value, label }]

    function el(tag, className, text) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    }
    function plural(n) {
      return n + (n === 1 ? ' company' : ' companies');
    }
    // GA4 events (gtag is only on production builds): searches, filters, companies opened, links followed from
    // company rows and copied links. GA's enhanced measurement also logs outbound clicks; tracker_link_click
    // adds the company and the kind of link.
    function track(name, params) {
      if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    }

    // Search the summary row plus the searchable parts of the details (description, customers,
    // partners, investors, news, X handles), but not the facts labels like "Website".
    // "Name~type|Name~type|" -> [{ name, type }]
    function pairs(value) {
      return (value || '').split('|').filter(Boolean).map(function (p) {
        var i = p.lastIndexOf('~');
        return { name: p.slice(0, i), type: p.slice(i + 1) };
      });
    }
    groups.forEach(function (group) {
      var text = [group.rows[0].textContent];
      group.querySelectorAll('[data-searchable]').forEach(function (node) { text.push(node.textContent); });
      group.searchText = text.join(' ').toLowerCase();
      group.firms = (group.dataset.founders || '').split('|').filter(Boolean);
      group.investors = (group.dataset.investors || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean);
      group.customerList = pairs(group.dataset.customers);
      group.partnerList = pairs(group.dataset.partners);
      group.relations = []; // "c:Name", "ct:Bank", "p:Name", "pt:AI lab"
    });

    // Everything a pick can be. Customers and partners are grouped by kind of firm (unknown kinds go in
    // the last, "Other", group) and each kind has an "Any bank customer"-style choice; founder backgrounds
    // are grouped as in page.legend.founder_firms (firms missing from it go under "Other").
    var KIND_LABEL = { customer: 'Customer', partner: 'Partner', investor: 'Investor', founder: 'Founders' };
    var relationKinds = [
      { kind: 'customer', prefix: 'c', list: 'customerList', head: 'Customers', types: [
        ['Bank', 'Banks', 'Any bank customer'], ['Hedge fund', 'Hedge funds', 'Any hedge fund customer'],
        ['Asset manager', 'Asset managers', 'Any asset manager customer'],
        ['Private equity', 'Private equity', 'Any private equity customer'],
        ['Private credit', 'Private credit', 'Any private credit customer'],
        ['Venture capital', 'Venture capital', 'Any VC customer'],
        ['Pension/Endowment', 'Pensions & endowments', 'Any pension / endowment customer'],
        ['Insurance', 'Insurers', 'Any insurer customer'],
        ['Broker/Exchange', 'Brokers & exchanges', 'Any broker / exchange customer'],
        ['Other financial', 'Other financial firms', '']] },
      { kind: 'partner', prefix: 'p', list: 'partnerList', head: 'Partners', types: [
        ['Data & research', 'Data & research', 'Any data & research partner'], ['AI lab', 'AI labs', 'Any AI lab partner'],
        ['Cloud & software', 'Cloud & software', 'Any cloud & software partner'],
        ['Exchange & market infrastructure', 'Market infrastructure', 'Any market infrastructure partner'],
        ['Consulting', 'Consulting', 'Any consulting partner'], ['Other', 'Other', '']] }
    ];
    var FOUNDER_GROUP_ANY = {
      'Hedge funds & trading firms': 'Any hedge fund or trading firm',
      'Banks & investment firms': 'Any bank or investment firm',
      'Tech companies': 'Any tech company'
    };
    var entries = [];
    var byValue = {};
    function addEntry(entry) {
      entries.push(entry);
      byValue[entry.kind + '|' + entry.value] = entry;
      return entry;
    }
    function findEntry(kind, value) {
      return byValue[kind + '|' + value];
    }

    relationKinds.forEach(function (rk) {
      var names = rk.types.map(function (t) { return t[0]; });
      var tally = {}, typeOf = {};
      groups.forEach(function (g) {
        g[rk.list].forEach(function (x) {
          if (names.indexOf(x.type) === -1) x.type = names[names.length - 1];
          tally[x.name] = (tally[x.name] || 0) + 1;
          typeOf[x.name] = typeOf[x.name] || x.type;
          g.relations.push(rk.prefix + ':' + x.name);
          if (g.relations.indexOf(rk.prefix + 't:' + x.type) === -1) g.relations.push(rk.prefix + 't:' + x.type);
        });
      });
      rk.types.forEach(function (t) {
        if (t[2]) addEntry({ kind: rk.kind, value: rk.prefix + 't:' + t[0], label: t[2], type: t[0], any: true });
      });
      Object.keys(tally).forEach(function (name) {
        addEntry({ kind: rk.kind, value: rk.prefix + ':' + name, label: name, type: typeOf[name], total: tally[name] });
      });
    });

    var investorTally = {};
    groups.forEach(function (g) { g.investors.forEach(function (i) { investorTally[i] = (investorTally[i] || 0) + 1; }); });
    Object.keys(investorTally).forEach(function (name) {
      addEntry({ kind: 'investor', value: name, label: name, total: investorTally[name] });
    });

    var firmGroups = [];
    try { firmGroups = JSON.parse(explorer.dataset.groups || '[]') || []; } catch (e) { firmGroups = []; }
    var groupOf = {};
    firmGroups.forEach(function (c) { (c.firms || []).forEach(function (f) { groupOf[f] = c.group; }); });
    var firmTally = {};
    groups.forEach(function (g) { g.firms.forEach(function (f) { firmTally[f] = (firmTally[f] || 0) + 1; }); });
    if (Object.keys(firmTally).length) addEntry({ kind: 'founder', value: '+', label: 'Any notable background', any: true });
    firmGroups.concat([{ group: 'Other' }]).forEach(function (c) {
      var has = Object.keys(firmTally).some(function (f) { return (groupOf[f] || 'Other') === c.group; });
      if (has && FOUNDER_GROUP_ANY[c.group]) {
        addEntry({ kind: 'founder', value: 'g:' + c.group, label: FOUNDER_GROUP_ANY[c.group], group: c.group, any: true });
      }
    });
    Object.keys(firmTally).forEach(function (firm) {
      addEntry({ kind: 'founder', value: firm, label: 'ex-' + firm, group: groupOf[firm] || 'Other', total: firmTally[firm] });
    });

    // Sections of the Browse panel (left rail). `any` is the section's "Any ..." choice, if it has one.
    var sections = [];
    function addSection(id, head, title, filter, any, alphabetical) {
      if (!entries.some(filter)) return;
      sections.push({ id: id, head: head, title: title, filter: filter, any: any, alphabetical: alphabetical });
    }
    // Order: customers, investors, founder backgrounds, partners.
    function addRelationSections(rk) {
      addSection(rk.head.toLowerCase(), rk.head, 'All ' + rk.head.toLowerCase(), function (e) { return e.kind === rk.kind && !e.any; });
      rk.types.forEach(function (t) {
        addSection(rk.prefix + ':' + t[0], null, t[1], function (e) { return e.kind === rk.kind && !e.any && e.type === t[0]; },
          findEntry(rk.kind, rk.prefix + 't:' + t[0]));
      });
    }
    addRelationSections(relationKinds[0]);
    addSection('investors', 'Investors', 'In 2+ companies', function (e) { return e.kind === 'investor' && e.total > 1; });
    addSection('investors-all', null, 'All investors (A–Z)', function (e) { return e.kind === 'investor'; }, null, true);
    addSection('founders', 'Founder backgrounds', 'All backgrounds', function (e) { return e.kind === 'founder' && !e.any; }, findEntry('founder', '+'));
    firmGroups.concat([{ group: 'Other' }]).forEach(function (c) {
      addSection('fg:' + c.group, null, c.group, function (e) { return e.kind === 'founder' && !e.any && e.group === c.group; },
        findEntry('founder', 'g:' + c.group));
    });
    addRelationSections(relationKinds[1]);

    // Matching
    // "Both" companies count as institutional and as consumer.
    function inFocus(group, focus) {
      return focus === '*' || group.dataset.focus === focus || group.dataset.focus === 'Both';
    }
    function inStatus(group, status) {
      return status === '*' || group.dataset.status === status;
    }
    function inCategory(group, category) {
      return category === '*' || group.dataset.category === category;
    }
    function hasPick(group, pick) {
      if (pick.kind === 'investor') return group.investors.indexOf(pick.value) !== -1;
      if (pick.kind === 'founder') {
        if (pick.value === '+') return group.firms.length > 0;
        if (pick.value.indexOf('g:') === 0) {
          var name = pick.value.slice(2);
          return group.firms.some(function (f) { return (groupOf[f] || 'Other') === name; });
        }
        return group.firms.indexOf(pick.value) !== -1;
      }
      return group.relations.indexOf(pick.value) !== -1;
    }
    function inSearch(group, terms) {
      return terms.every(function (t) { return group.searchText.indexOf(t) !== -1; });
    }
    function matches(group, f) {
      return inFocus(group, f.focus) && inStatus(group, f.status) && inCategory(group, f.category) &&
        f.picks.every(function (p) { return hasPick(group, p); }) && inSearch(group, f.terms);
    }
    function currentFilters() {
      return {
        focus: activeFocus,
        status: activeStatus,
        category: categorySelect.value,
        picks: picks.slice(),
        terms: search.value.toLowerCase().split(/\s+/).filter(Boolean)
      };
    }
    function withFilter(filters, key, value) {
      var copy = Object.assign({}, filters);
      copy[key] = value;
      return copy;
    }
    function countWhere(filters) {
      return groups.filter(function (g) { return matches(g, filters); }).length;
    }
    // How many companies a pick would leave, given everything else; picks already applied count as is.
    function countWith(filters, entry) {
      if (isPicked(entry)) return countWhere(filters);
      return countWhere(withFilter(filters, 'picks', filters.picks.concat([entry])));
    }
    function isPicked(entry) {
      return picks.some(function (p) { return p.kind === entry.kind && p.value === entry.value; });
    }

    // Each category option shows how many companies it would leave given the other filters, so the
    // numbers always match what choosing it shows. Choices that would leave nothing are disabled.
    function updateOptions(select, key, filters) {
      Array.prototype.forEach.call(select.options, function (option) {
        if (!option.dataset.label) return;
        var n = countWhere(withFilter(filters, key, option.value));
        option.textContent = option.dataset.label + ' (' + n + ')';
        option.disabled = n === 0 && !option.selected;
      });
    }

    var relationTags = table.querySelectorAll('.tracker-tag[data-relation]');
    // Each customer / partner pill knows which picks it matches ("c:Name" and "ct:Bank").
    relationTags.forEach(function (tag) {
      var g = tag.closest('tbody');
      var rk = relationKinds.filter(function (k) { return tag.dataset.relation.indexOf(k.prefix + ':') === 0; })[0];
      var name = tag.dataset.relation.slice(2);
      var item = rk && g[rk.list].filter(function (x) { return x.name === name; })[0];
      tag.relationKeys = [tag.dataset.relation].concat(item ? [rk.prefix + 't:' + item.type] : []);
    });

    function applyFilters() {
      var filters = currentFilters();
      var shown = 0;
      groups.forEach(function (group) {
        var match = matches(group, filters);
        group.hidden = !match;
        if (match) shown++;
      });
      updateOptions(categorySelect, 'category', filters);
      // The focus buttons are icons only; their tooltips carry the label and the live count.
      focusButtons.forEach(function (button) {
        if (!button.dataset.label) return;
        button.title = button.dataset.label + ' (' + countWhere(withFilter(filters, 'focus', button.dataset.focus)) + ')';
      });
      // Status tabs show how many companies each status would leave, given the other filters.
      statusButtons.forEach(function (button) {
        button.querySelector('[data-n]').textContent = countWhere(withFilter(filters, 'status', button.dataset.status));
      });
      count.textContent = shown === groups.length
        ? groups.length + ' companies'
        : shown + ' of ' + groups.length + ' companies';
      empty.hidden = shown > 0;
      categorySelect.classList.toggle('is-active', filters.category !== '*');
      relationTags.forEach(function (tag) {
        tag.classList.toggle('is-match', picks.some(function (p) { return tag.relationKeys.indexOf(p.value) !== -1; }));
      });
      clearButton.hidden = filters.focus === '*' && filters.status === '*' && filters.category === '*' &&
        !filters.picks.length && !filters.terms.length;
      renderPicks();
      fitSelect(categorySelect);
      shareButton.hidden = clearButton.hidden;
      updateFab();
      writeUrl();
      if (suggestOpen) renderSuggest();
      if (!explorer.hidden) renderExplorer();
    }

    // The category dropdown is as wide as its current choice (not its longest option).
    var measure = document.createElement('canvas').getContext('2d');
    function fitSelect(select) {
      var style = getComputedStyle(select);
      measure.font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
      var text = select.options[select.selectedIndex].textContent;
      var width = measure.measureText(text).width + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + 2;
      select.style.setProperty('--fit-width', Math.ceil(width) + 'px');
    }
    if (document.fonts) document.fonts.ready.then(function () { fitSelect(categorySelect); });

    // Picks: chosen filters, shown as removable chips under the search box.
    function kindTag(kind) {
      return el('span', 'tracker-kind is-' + kind, KIND_LABEL[kind] || kind);
    }
    function addPick(entry) {
      if (!isPicked(entry)) {
        picks.push({ kind: entry.kind, value: entry.value, label: entry.label });
        var param = pickParam(entry);
        track('tracker_filter', { filter_type: param[0], filter_value: param[1] });
      }
      search.value = '';
      closeSuggest();
      closeExplorer();
      applyFilters();
    }
    function removePick(index) {
      picks.splice(index, 1);
      applyFilters();
    }
    function renderPicks() {
      picksRow.replaceChildren();
      picks.forEach(function (p, i) {
        var chip = el('span', 'tracker-pick');
        chip.append(kindTag(p.kind), el('span', 'tracker-pick-label', p.label));
        var remove = el('button', 'tracker-pick-remove', '×');
        remove.type = 'button';
        remove.setAttribute('aria-label', 'Remove filter: ' + KIND_LABEL[p.kind] + ' ' + p.label);
        remove.addEventListener('click', function () { removePick(i); });
        chip.append(remove);
        picksRow.append(chip);
      });
      picksRow.hidden = !picks.length;
      syncStickyOffset();
    }
    function chipFor(entry, n, showKind) {
      var b = el('button', 'tracker-chip' + (entry.any ? ' is-any' : '') + (isPicked(entry) ? ' is-picked' : ''));
      b.type = 'button';
      if (showKind) b.append(kindTag(entry.kind));
      b.append(el('span', 'tracker-chip-label', entry.label), el('span', 'tracker-chip-n', String(n)));
      b.disabled = n === 0;
      b.addEventListener('click', function () { addPick(entry); });
      return b;
    }
    // Entries matching a query, best first: starts with it, then a word starts with it, then contains it.
    function rankMatches(q, pool, filters) {
      var out = [];
      pool.forEach(function (e) {
        // "ex-Goldman Sachs" matches "gold" as well as "Goldman Sachs" does.
        var label = e.label.toLowerCase().replace(/^ex-/, '');
        var i = label.indexOf(q);
        if (i === -1) return;
        var n = countWith(filters, e);
        if (!n) return;
        out.push({ entry: e, n: n, rank: i === 0 ? 0 : (/[\s\-(&./]/.test(label.charAt(i - 1)) ? 1 : 2) });
      });
      return out.sort(function (a, b) {
        return a.rank - b.rank || b.n - a.n || a.entry.label.localeCompare(b.entry.label);
      });
    }

    // Suggestions under the search box: the most-connected firms when it's empty, typed matches otherwise.
    var suggestOpen = false;
    var options = [];
    var activeIndex = -1;
    function openSuggest() {
      suggestOpen = true;
      renderSuggest();
    }
    function closeSuggest() {
      suggestOpen = false;
      suggest.hidden = true;
      search.setAttribute('aria-expanded', 'false');
      search.removeAttribute('aria-activedescendant');
    }
    function setActive(i) {
      activeIndex = i;
      options.forEach(function (o, k) {
        o.node.classList.toggle('is-active', k === i);
        o.node.setAttribute('aria-selected', String(k === i));
      });
      if (options[i]) {
        search.setAttribute('aria-activedescendant', options[i].node.id);
        options[i].node.scrollIntoView({ block: 'nearest' });
      }
    }
    function addOption(tag, label, meta, action) {
      var node = el('div', 'tracker-option');
      node.id = 'tracker-option-' + options.length;
      node.setAttribute('role', 'option');
      node.append(tag, el('span', 'tracker-option-label', label), el('span', 'tracker-option-meta', meta));
      node.addEventListener('mousedown', function (e) { e.preventDefault(); }); // keep focus in the search box
      node.addEventListener('click', action);
      suggest.append(node);
      options.push({ node: node, action: action });
    }
    function renderSuggest() {
      var q = search.value.trim().toLowerCase();
      var filters = currentFilters();
      suggest.replaceChildren();
      options = [];
      activeIndex = -1;
      search.removeAttribute('aria-activedescendant');
      suggest.classList.toggle('is-browse', !q);
      if (!q) {
        [['customer', 'Customers', 'customers'], ['investor', 'Investors', 'investors'],
          ['founder', 'Founder backgrounds', 'founders'], ['partner', 'Partners', 'partners']].forEach(function (s) {
          var pool = entries.filter(function (e) { return e.kind === s[0] && (!e.any || e.value === '+'); });
          var top = pool.map(function (e) { return { entry: e, n: countWith(filters, e) }; })
            .filter(function (x) { return x.n > 0; })
            .sort(function (a, b) { return (b.entry.any ? 1 : 0) - (a.entry.any ? 1 : 0) || b.n - a.n || a.entry.label.localeCompare(b.entry.label); })
            .slice(0, 8);
          if (!top.length) return;
          var head = el('div', 'tracker-suggest-head');
          head.append(el('span', 'tracker-suggest-title', s[1]));
          var all = el('button', 'tracker-suggest-all', 'All ' + pool.filter(function (e) { return !e.any; }).length + ' ›');
          all.type = 'button';
          all.addEventListener('click', function () { openExplorer(s[2]); });
          head.append(all);
          var chips = el('div', 'tracker-chips');
          top.forEach(function (x) { chips.append(chipFor(x.entry, x.n)); });
          suggest.append(head, chips);
        });
        suggest.append(el('p', 'tracker-suggest-foot', 'Type to search companies, customers, partners, investors and founder backgrounds at once.'));
      } else {
        // First (and chosen by default): the plain text search, so Enter keeps what was typed.
        addOption(el('span', 'tracker-kind is-text', 'Text'), 'Search all text for “' + search.value.trim() + '”',
          plural(countWhere(filters)), function () { closeSuggest(); });
        rankMatches(q, entries, filters).slice(0, 8).forEach(function (m) {
          addOption(kindTag(m.entry.kind), m.entry.label, plural(m.n), function () { addPick(m.entry); });
        });
        groups.filter(function (g) { return (g.dataset.name || '').toLowerCase().indexOf(q) !== -1; }).slice(0, 3).forEach(function (g) {
          addOption(el('span', 'tracker-kind is-company', 'Company'), g.dataset.name, g.dataset.category || '', function () { jumpTo(g); });
        });
        setActive(0);
      }
      suggest.hidden = false;
      search.setAttribute('aria-expanded', 'true');
    }
    function jumpTo(group) {
      search.value = '';
      closeSuggest();
      applyFilters();
      if (location.hash === '#' + group.id) openFromHash(); else location.hash = group.id;
    }

    // Browse panel: kinds on the left; every firm of the chosen kind as chips on the right, with a find box.
    var explorerSection = 'customers';
    var rail = el('div', 'tracker-explorer-rail');
    var main = el('div', 'tracker-explorer-main');
    var explorerTop = el('div', 'tracker-explorer-top');
    var find = el('input', 'tracker-explorer-find');
    find.type = 'search';
    find.placeholder = 'Find a customer, partner, investor or firm…';
    find.setAttribute('aria-label', 'Find a customer, partner, investor or founder background');
    var closeX = el('button', 'tracker-explorer-close');
    closeX.type = 'button';
    closeX.setAttribute('aria-label', 'Close');
    closeX.append(el('span', 'tracker-explorer-x', '×'), el('span', 'tracker-explorer-done', 'Done'));
    // On phones a native picker stands in for the rail (CSS shows one or the other).
    var picker = el('select', 'tracker-explorer-picker');
    picker.setAttribute('aria-label', 'Show');
    (function buildPicker() {
      var optgroup = null;
      sections.forEach(function (s) {
        if (s.head) {
          optgroup = el('optgroup');
          optgroup.label = s.head;
          picker.append(optgroup);
        }
        (optgroup || picker).append(new Option(s.title, s.id));
      });
    })();
    explorerTop.append(picker, find, closeX);
    var explorerTitle = el('p', 'tracker-explorer-title');
    var body = el('div', 'tracker-explorer-body');
    main.append(explorerTop, explorerTitle, body);
    // One row per firm: name, its kind of firm when the list mixes kinds, and how many companies it would leave.
    var TYPE_LABEL = { 'Pension/Endowment': 'Pension / endowment', 'Broker/Exchange': 'Broker / exchange',
      'Exchange & market infrastructure': 'Market infrastructure' };
    function rowFor(entry, n, opts) {
      var b = el('button', 'tracker-explorer-item' + (entry.any ? ' is-any' : '') + (isPicked(entry) ? ' is-picked' : ''));
      b.type = 'button';
      b.dataset.value = entry.kind + '|' + entry.value;
      if (opts.kind) b.append(kindTag(entry.kind));
      b.append(el('span', 'tracker-explorer-item-label', entry.label));
      if (opts.type && entry.type) b.append(el('span', 'tracker-explorer-item-type', TYPE_LABEL[entry.type] || entry.type));
      b.append(el('span', 'tracker-explorer-item-n', String(n)));
      b.addEventListener('click', function () { addPick(entry); });
      return b;
    }
    explorer.append(rail, main);

    // "Customers · Banks", "Investors · In 2+ companies", "All partners": clear even out of context.
    function sectionLabel(s) {
      if (/^All /.test(s.title)) return s.id === 'founders' ? 'All founder backgrounds' : s.title;
      var parent = s.head ? s : sections.slice(0, sections.indexOf(s)).filter(function (x) { return x.head; }).pop();
      return (parent ? parent.head + ' · ' : '') + s.title;
    }
    // Phones get a short placeholder (the long one gets cut off).
    if (window.matchMedia && window.matchMedia('(max-width: 720px)').matches) search.placeholder = 'Search or filter';
    // Touch screens don't get the find box focused on open, so the keyboard doesn't cover the list.
    var touchy = window.matchMedia ? window.matchMedia('(max-width: 720px), (pointer: coarse)') : { matches: false };
    function openExplorer(sectionId) {
      if (explorer.hidden) track('tracker_browse');
      if (sectionId) explorerSection = sectionId;
      closeSuggest();
      find.value = '';
      explorer.hidden = false;
      browseButton.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('tracker-sheet-open');
      renderExplorer();
      if (!touchy.matches) find.focus({ preventScroll: true });
    }
    function closeExplorer() {
      if (explorer.hidden) return;
      explorer.hidden = true;
      browseButton.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('tracker-sheet-open');
    }
    function renderExplorer() {
      var filters = currentFilters();
      var section = sections.filter(function (s) { return s.id === explorerSection; })[0] || sections[0];
      if (!section) return;
      rail.replaceChildren();
      var activeButton = null;
      sections.forEach(function (s) {
        if (s.head) rail.append(el('p', 'tracker-explorer-head', s.head));
        var b = el('button', 'tracker-explorer-section' + (s === section ? ' is-active' : ''));
        if (s === section) activeButton = b;
        b.type = 'button';
        b.dataset.section = s.id;
        b.append(el('span', '', s.title));
        if (s.any) b.append(el('span', 'tracker-chip-n', String(countWith(filters, s.any))));
        b.addEventListener('click', function () {
          explorerSection = s.id;
          find.value = '';
          renderExplorer();
        });
        rail.append(b);
      });
      picker.value = section.id;
      Array.prototype.forEach.call(picker.options, function (o) {
        var s = sections.filter(function (x) { return x.id === o.value; })[0];
        o.textContent = sectionLabel(s) + (s.any ? ' (' + countWith(filters, s.any) + ')' : '');
      });
      // Keep the chosen section in view in the rail.
      if (activeButton) {
        var r = rail.getBoundingClientRect(), a = activeButton.getBoundingClientRect();
        if (a.left < r.left || a.right > r.right) rail.scrollLeft += a.left - r.left - 12;
        if (a.top < r.top || a.bottom > r.bottom) rail.scrollTop += a.top - r.top - 40;
      }
      body.replaceChildren();
      body.scrollTop = 0;
      var list = el('div', 'tracker-explorer-list');
      var q = find.value.trim().toLowerCase();
      if (q) {
        var found = rankMatches(q, entries, filters);
        explorerTitle.textContent = found.length ? 'Matches for “' + find.value.trim() + '”' : 'Nothing matches “' + find.value.trim() + '” with the current filters';
        found.slice(0, 80).forEach(function (m) { list.append(rowFor(m.entry, m.n, { kind: true })); });
        body.append(list);
        return;
      }
      explorerTitle.textContent = sectionLabel(section);
      if (section.any) body.append(rowFor(section.any, countWith(filters, section.any), {}));
      // With other filters on, firms that would leave no companies are left out (and counted).
      var mixed = /^(customers|partners)$/.test(section.id);
      var items = entries.filter(section.filter).map(function (e) { return { entry: e, n: countWith(filters, e) }; });
      var hidden = items.filter(function (x) { return !x.n; }).length;
      items.filter(function (x) { return x.n; })
        .sort(function (a, b) {
          return section.alphabetical ? a.entry.label.localeCompare(b.entry.label)
            : b.n - a.n || a.entry.label.localeCompare(b.entry.label);
        })
        .forEach(function (x) { list.append(rowFor(x.entry, x.n, { type: mixed })); });
      body.append(list);
      if (hidden) body.append(el('p', 'tracker-explorer-note', hidden + ' more ' + (hidden === 1 ? 'has' : 'have') + ' no companies in the current results.'));
    }

    // Shareable views: ?q=...&status=Active&category=...&partner=FactSet&investor=...&sort=raised-desc
    var PICK_PARAMS = [['customer', 'customer', 'c:'], ['customer-type', 'customer', 'ct:'], ['partner', 'partner', 'p:'],
      ['partner-type', 'partner', 'pt:'], ['investor', 'investor', ''], ['founder', 'founder', ''], ['founder-group', 'founder', 'g:']];
    var currentSort = '';
    // A pick as [URL parameter, value], e.g. ['partner', 'FactSet'], ['founder-group', 'Tech companies'], ['founder', 'any']
    function pickParam(p) {
      var v = p.value;
      if (p.kind === 'investor') return ['investor', v];
      if (p.kind === 'founder') {
        if (v === '+') return ['founder', 'any'];
        return v.indexOf('g:') === 0 ? ['founder-group', v.slice(2)] : ['founder', v];
      }
      var type = /^[cp]t:/.test(v);
      return [p.kind + (type ? '-type' : ''), v.slice(type ? 3 : 2)];
    }
    function writeUrl() {
      if (!window.history || !history.replaceState) return;
      var params = new URLSearchParams();
      if (search.value.trim()) params.set('q', search.value.trim());
      if (activeFocus !== '*') params.set('focus', activeFocus);
      if (activeStatus !== '*') params.set('status', activeStatus);
      if (categorySelect.value !== '*') params.set('category', categorySelect.value);
      picks.forEach(function (p) {
        var param = pickParam(p);
        params.append(param[0], param[1]);
      });
      if (currentSort) params.set('sort', currentSort);
      var qs = params.toString();
      var url = location.pathname + (qs ? '?' + qs : '') + location.hash;
      if (url !== location.pathname + location.search + location.hash) history.replaceState(history.state, '', url);
    }
    function readUrl() {
      var params = new URLSearchParams(location.search);
      if (params.get('q')) search.value = params.get('q');
      var focus = params.get('focus');
      if (focus && Array.prototype.some.call(focusButtons, function (b) { return b.dataset.focus === focus; })) {
        activeFocus = focus;
        press(focusButtons, 'focus', focus);
      }
      var status = params.get('status');
      if (status && Array.prototype.some.call(statusButtons, function (b) { return b.dataset.status === status; })) {
        activeStatus = status;
        press(statusButtons, 'status', status);
      }
      var category = params.get('category');
      if (category !== null && Array.prototype.some.call(categorySelect.options, function (o) { return o.value === category; })) categorySelect.value = category;
      PICK_PARAMS.forEach(function (d) {
        params.getAll(d[0]).forEach(function (v) {
          var entry = findEntry(d[1], d[2] + (d[1] === 'founder' && v === 'any' ? '+' : v));
          if (entry && !isPicked(entry)) picks.push({ kind: entry.kind, value: entry.value, label: entry.label });
        });
      });
      var sort = params.get('sort');
      if (sort) {
        var m = sort.match(/^(\w+)-(asc|desc)$/);
        var th = m && table.querySelector('thead th.col-' + m[1]);
        if (th && th.querySelector('button[data-sort]')) sortBy(th.querySelector('button[data-sort]'), m[2] === 'asc' ? 'ascending' : 'descending');
      }
    }
    function copyText(text, button, done) {
      var original = button.dataset.label || button.textContent;
      button.dataset.label = original;
      function ok() {
        button.classList.add('is-copied');
        button.lastChild.textContent = done;
        setTimeout(function () { button.classList.remove('is-copied'); button.lastChild.textContent = original.trim(); }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, function () { window.prompt('Copy this link:', text); });
      else window.prompt('Copy this link:', text);
    }

    function press(buttons, attr, value) {
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset[attr] === value)); });
    }
    function setFocus(value) {
      activeFocus = value;
      press(focusButtons, 'focus', value);
      applyFilters();
    }
    function setStatus(value) {
      activeStatus = value;
      press(statusButtons, 'status', value);
      applyFilters();
    }

    function resetFilters() {
      search.value = '';
      categorySelect.value = '*';
      picks = [];
      activeStatus = '*';
      press(statusButtons, 'status', '*');
      setFocus('*');
    }

    function sortBy(button, forced) {
      var th = button.closest('th');
      var col = th.cellIndex;
      // A column can ask to sort descending on its first click (e.g. latest round: newest first).
      var current = th.getAttribute('aria-sort');
      var dir = forced || (current ? (current === 'ascending' ? 'descending' : 'ascending') : (button.dataset.sortFirst || 'ascending'));
      var name = (th.className.match(/col-(\w+)/) || [])[1];
      currentSort = name === 'company' && dir === 'ascending' ? '' : name + '-' + (dir === 'ascending' ? 'asc' : 'desc');
      var sign = dir === 'ascending' ? 1 : -1;
      sortButtons.forEach(function (b) { b.closest('th').removeAttribute('aria-sort'); });
      th.setAttribute('aria-sort', dir);

      function key(group, i) {
        var cell = group.rows[0].cells[i];
        return (cell.dataset.sort !== undefined ? cell.dataset.sort : cell.textContent).trim();
      }
      function compare(a, b) {
        return a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });
      }
      groups.sort(function (a, b) {
        var ka = key(a, col), kb = key(b, col);
        // Blank cells always sink to the bottom, regardless of direction;
        // ties fall back to company name so groups stay alphabetical.
        var order = (!ka || !kb) ? (!ka) - (!kb) : sign * compare(ka, kb);
        return order || compare(key(a, 1), key(b, 1));
      });
      groups.forEach(function (group) { table.appendChild(group); });
      writeUrl();
    }

    function setExpanded(group, open) {
      group.classList.toggle('is-open', open);
      group.rows[1].hidden = !open;
      group.querySelector('.tracker-toggle').setAttribute('aria-expanded', String(open));
      if (!open && popover.parentNode && group.contains(popover)) closePopover();
    }

    // Open the company named in the URL hash (e.g. #hebbia), clearing filters if it is hidden.
    function openFromHash() {
      var id = decodeURIComponent(location.hash.slice(1));
      var group = id && document.getElementById(id);
      if (!group || group.parentNode !== table) return;
      if (group.hidden) resetFilters();
      if (!group.classList.contains('is-open')) track('tracker_company_open', { company: group.dataset.name });
      setExpanded(group, true);
      group.scrollIntoView({ block: 'start' });
      group.classList.remove('is-highlighted');
      void group.offsetWidth; // restart the highlight animation
      group.classList.add('is-highlighted');
    }

    // Source popover: clicking a customer or partner shows where the claim comes from, with a link.
    var popover = document.createElement('div');
    popover.className = 'tracker-popover';
    popover.setAttribute('role', 'dialog');
    var openTag = null;

    function openPopover(tag) {
      closePopover();
      var d = tag.dataset;
      var date = d.date && !isNaN(Date.parse(d.date)) ? dateFormat.format(new Date(d.date)) : '';
      var source = d.source && d.source !== d.sourceLabel ? d.source : '';
      var head = el('p', 'tracker-popover-type');
      var icon = el('span', 'tracker-src');
      icon.setAttribute('aria-hidden', 'true');
      head.append(icon, d.sourceLabel);
      popover.replaceChildren(head);
      var meta = [source, date].filter(Boolean).join(' · ');
      if (meta) popover.append(el('p', 'tracker-popover-meta', meta));
      var link = el('a', 'tracker-popover-link', 'Open source');
      link.href = tag.href;
      link.target = '_blank';
      link.rel = 'noopener';
      link.insertAdjacentHTML('beforeend', '<svg class="tracker-ext" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3h7v7M13 3 6.5 9.5M11 9.5V13H3V5h3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
      popover.append(link);
      var relation = tag.dataset.relation;
      var shared = relation ? groups.filter(function (g) { return g.relations.indexOf(relation) !== -1; }).length : 0;
      if (shared > 1) {
        var show = el('button', 'tracker-popover-filter',
          'Show all ' + shared + ' companies with this ' + (relation.charAt(0) === 'c' ? 'customer' : 'partner'));
        show.type = 'button';
        show.addEventListener('click', function () {
          var entry = findEntry(relation.charAt(0) === 'c' ? 'customer' : 'partner', relation);
          closePopover();
          if (entry) addPick(entry);
        });
        popover.append(show);
      }
      popover.setAttribute('aria-label', 'Source for ' + tag.textContent.trim());
      popover.dataset.sourceType = d.sourceType;
      popover.style.left = '';
      tag.parentNode.appendChild(popover);
      // Keep the popover on screen.
      var rect = popover.getBoundingClientRect();
      var overflow = rect.right - (document.documentElement.clientWidth - 8);
      if (overflow > 0) popover.style.left = -overflow + 'px';
      tag.setAttribute('aria-expanded', 'true');
      openTag = tag;
    }

    function closePopover() {
      if (popover.parentNode) popover.parentNode.removeChild(popover);
      if (openTag) openTag.setAttribute('aria-expanded', 'false');
      openTag = null;
    }

    table.querySelectorAll('.tracker-tag[data-source-type]').forEach(function (tag) {
      tag.removeAttribute('title'); // the popover replaces the native tooltip
      tag.setAttribute('aria-haspopup', 'dialog');
      tag.setAttribute('aria-expanded', 'false');
    });

    // The whole summary row toggles its details, except links and text selections.
    table.addEventListener('click', function (e) {
      var tag = e.target.closest('.tracker-tag[data-source-type]');
      if (tag && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        if (openTag === tag) closePopover(); else openPopover(tag);
        return;
      }
      var copy = e.target.closest('[data-copy-link]');
      if (copy) {
        copyText(location.origin + location.pathname + '#' + copy.dataset.copyLink, copy, 'Link copied');
        track('tracker_share', { link_type: 'company', company: copy.closest('tbody').dataset.name });
        return;
      }
      var investor = e.target.closest('.tracker-investor');
      if (investor) {
        var entry = findEntry('investor', investor.dataset.investor);
        if (entry) addPick(entry);
        return;
      }
      var row = e.target.closest('.tracker-row');
      if (!row || e.target.closest('a')) return;
      if (!e.target.closest('button') && String(window.getSelection())) return;
      var opening = !row.parentNode.classList.contains('is-open');
      if (opening) track('tracker_company_open', { company: row.parentNode.dataset.name });
      setExpanded(row.parentNode, opening);
    });

    // Links followed from a company row or its source popover: which company, and what kind of link.
    function linkType(a) {
      var tag = a.closest('.tracker-popover') ? openTag : a.closest('.tracker-tag[data-relation]');
      if (tag) return tag.dataset.relation.charAt(0) === 'p' ? 'partner source' : 'customer source';
      if (a.closest('.tracker-news')) return 'news';
      if (a.closest('.tracker-media')) return 'media';
      if (a.closest('.tracker-round')) return 'funding';
      if (a.closest('.tracker-valuation, .tracker-valuation-line')) return 'valuation';
      if (a.closest('.tracker-founder-src')) return 'founder background';
      if (a.closest('.tracker-panel-links')) return 'suggest edit';
      if (/(^|\.)linkedin\.com$/.test(a.hostname)) return 'linkedin';
      if (/(^|\.)(x|twitter)\.com$/.test(a.hostname)) return 'x';
      if (a.closest('.tracker-description, .tracker-note')) return 'description';
      return 'website';
    }
    function trackLink(e) {
      if (e.type === 'auxclick' && e.button !== 1) return;
      var a = e.target.closest('a[href]');
      var group = a && a.closest('tbody');
      if (!group || !/^https?:$/.test(a.protocol) || a.hostname === location.hostname) return;
      // A plain click on a customer or partner opens its source popover instead of following the link.
      if (e.type === 'click' && a.matches('.tracker-tag[data-source-type]') && !e.metaKey && !e.ctrlKey && !e.shiftKey) return;
      track('tracker_link_click', { company: group.dataset.name, link_type: linkType(a), link_domain: a.hostname.replace(/^www\./, ''), link_url: a.href });
    }
    table.addEventListener('click', trackLink);
    table.addEventListener('auxclick', trackLink);
    document.addEventListener('click', function (e) {
      if (openTag && !e.target.closest('.tracker-popover') && !e.target.closest('.tracker-tag[data-source-type]')) closePopover();
      // The path is fixed when the click starts, so a rail button the panel re-rendered away still counts as inside.
      var path = e.composedPath();
      if (!explorer.hidden && path.indexOf(explorer) === -1 && path.indexOf(browseButton) === -1 && path.indexOf(omni) === -1) closeExplorer();
    });

    // Search box: typing filters by text right away and suggests filters; arrows + Enter pick one.
    // A search is logged once typing pauses, so "heb", "hebb", "hebbia" count as one search for "hebbia".
    var searchTimer;
    var lastTerm = '';
    search.addEventListener('input', function () {
      applyFilters();
      if (!suggestOpen) openSuggest();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        var term = search.value.trim().toLowerCase();
        if (term.length > 1 && term !== lastTerm) track('view_search_results', { search_term: term });
        lastTerm = term;
      }, 1500);
    });
    search.addEventListener('focus', function () {
      closeExplorer();
      openSuggest();
    });
    search.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!suggestOpen) openSuggest();
        if (options.length) {
          e.preventDefault();
          setActive((activeIndex + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
        }
      } else if (e.key === 'Enter') {
        if (suggestOpen && options[activeIndex]) {
          e.preventDefault();
          options[activeIndex].action();
        }
      } else if (e.key === 'Escape') {
        if (suggestOpen) closeSuggest(); else { search.value = ''; applyFilters(); }
      } else if (e.key === 'Backspace' && !search.value && picks.length) {
        removePick(picks.length - 1); // like deleting the last chip in an input
      }
    });
    omni.addEventListener('focusout', function (e) {
      if (!omni.contains(e.relatedTarget)) closeSuggest();
    });
    browseButton.addEventListener('click', function () {
      if (explorer.hidden) openExplorer(); else closeExplorer();
    });
    closeX.addEventListener('click', function () {
      closeExplorer();
      browseButton.focus();
    });
    find.addEventListener('input', renderExplorer);
    picker.addEventListener('change', function () {
      explorerSection = picker.value;
      find.value = '';
      renderExplorer();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && openTag) {
        var tag = openTag;
        closePopover();
        tag.focus();
        return;
      }
      if (e.key === 'Escape' && !explorer.hidden) {
        closeExplorer();
        browseButton.focus();
        return;
      }
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        search.focus();
      }
    });
    categorySelect.addEventListener('change', function () {
      if (categorySelect.value !== '*') track('tracker_filter', { filter_type: 'category', filter_value: categorySelect.value || 'Unclassified' });
      applyFilters();
    });
    clearButton.addEventListener('click', resetFilters);
    shareButton.addEventListener('click', function () {
      copyText(location.href.split('#')[0], shareButton, 'Link copied');
      track('tracker_share', { link_type: 'view' });
    });
    focusButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        if (button.dataset.focus !== '*') track('tracker_filter', { filter_type: 'focus', filter_value: button.dataset.focus });
        setFocus(button.dataset.focus);
      });
    });
    // Clicking the selected status again goes back to all statuses.
    statusButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var status = button.dataset.status === activeStatus ? '*' : button.dataset.status;
        if (status !== '*') track('tracker_filter', { filter_type: 'status', filter_value: status });
        setStatus(status);
      });
    });
    sortButtons.forEach(function (button) {
      button.addEventListener('click', function () { sortBy(button); });
    });
    tracker.querySelector('[data-tracker-reset]').addEventListener('click', resetFilters);
    window.addEventListener('hashchange', openFromHash);

    var toolbarInView = true;
    function updateFab() {
      var phone = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
      var n = picks.length + (activeFocus !== '*') + (activeStatus !== '*') + (categorySelect.value !== '*') + (search.value.trim() ? 1 : 0);
      fab.querySelector('[data-tracker-fab-n]').textContent = n ? ' · ' + n : '';
      fab.hidden = !phone || toolbarInView || !explorer.hidden;
    }
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (seen) {
        toolbarInView = seen[0].isIntersecting || seen[0].boundingClientRect.top > 0;
        updateFab();
      }).observe(toolbar);
    }
    fab.addEventListener('click', function () {
      toolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Missing favicons (Google's 16px globe) become a tile with the company's initial.
    function hue(text) {
      var h = 0;
      for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 360;
      return h;
    }
    tracker.querySelectorAll('img.tracker-logo').forEach(function (img) {
      var name = (img.closest('tbody') || { dataset: {} }).dataset.name || '';
      function swap() {
        if (!img.isConnected) return; // already swapped
        var tile = el('span', 'tracker-logo tracker-monogram', img.dataset.initial || '?');
        tile.setAttribute('aria-hidden', 'true');
        tile.style.setProperty('--hue', hue(name));
        img.replaceWith(tile);
      }
      function check() { if (img.naturalWidth && img.naturalWidth <= 16) swap(); }
      img.addEventListener('load', check);
      img.addEventListener('error', swap);
      if (img.complete) { if (img.naturalWidth) check(); else swap(); }
    });
    tracker.querySelectorAll('.tracker-monogram').forEach(function (tile) {
      tile.style.setProperty('--hue', hue(tile.closest('tbody').dataset.name || ''));
    });

    // Sticky column headers sit just below the sticky toolbar.
    function syncStickyOffset() {
      tracker.style.setProperty('--tracker-toolbar-height', toolbar.offsetHeight + 'px');
    }
    window.addEventListener('resize', syncStickyOffset);

    // Long news lists show the newest six until expanded (all items stay searchable).
    tracker.querySelectorAll('[data-tracker-more]').forEach(function (button) {
      var list = button.previousElementSibling;
      list.classList.add('is-collapsed');
      button.hidden = false;
      button.addEventListener('click', function () {
        list.classList.remove('is-collapsed');
        button.hidden = true;
      });
    });

    toolbar.hidden = false;
    tracker.querySelector('[data-tracker-meta]').hidden = false;
    tracker.classList.add('is-enhanced');
    syncStickyOffset();
    readUrl();
    applyFilters();
    if (location.hash) openFromHash();
  });
})();
