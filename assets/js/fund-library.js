// Search, filters, sorting and expandable rows for _includes/fund-library.html (How Hedge Funds Use AI).
// The page is fully rendered by Jekyll; this only adds interactivity.
// Two views: "By fund" (the table) and "All items" (every podcast, talk and post, newest first). The search box,
// strategy dropdown and format tabs filter both. The address follows the view, filters and sort.
(function () {
  // GA4 events (gtag is only on production builds). Parameter names match the startup tracker's, so the same
  // custom dimensions (company, link_type, filter_type, filter_value) work for this page.
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  document.querySelectorAll('a[data-subscribe]').forEach(function (a) {
    function trackSubscribe(e) {
      if (e.type === 'click' || e.button === 1) track('library_subscribe_click');
    }
    a.addEventListener('click', trackSubscribe);
    a.addEventListener('auxclick', trackSubscribe);
  });

  document.querySelectorAll('[data-library]').forEach(function (root) {
    var table = root.querySelector('[data-library-funds]');
    var feed = root.querySelector('[data-library-feed]');
    var groups = Array.prototype.slice.call(table.tBodies);
    var entries = Array.prototype.slice.call(feed.querySelectorAll('.library-entry'));
    var years = Array.prototype.slice.call(feed.querySelectorAll('.library-year'));
    var toolbar = root.querySelector('[data-tracker-toolbar]');
    var meta = root.querySelector('[data-tracker-meta]');
    var search = root.querySelector('[data-library-search]');
    var strategySelect = root.querySelector('[data-library-strategy]');
    var viewButtons = root.querySelectorAll('button[data-view]');
    var formatButtons = root.querySelectorAll('[data-tracker-meta] button[data-format]');
    var sortButtons = table.querySelectorAll('th button[data-sort]');
    var count = root.querySelector('[data-library-count]');
    var clearButton = root.querySelector('[data-library-clear]');
    var shareButton = root.querySelector('[data-library-share]');
    var empty = root.querySelector('[data-library-empty]');
    var view = 'funds';
    var format = '*';
    var DEFAULT_SORT = 'items-desc';
    var currentSort = DEFAULT_SORT;

    function textOf(node) {
      return node.textContent.replace(/\s+/g, ' ').toLowerCase();
    }
    groups.forEach(function (group) {
      var text = [group.rows[0].textContent];
      group.querySelectorAll('[data-searchable]').forEach(function (node) { text.push(node.textContent); });
      group.searchText = text.join(' ').replace(/\s+/g, ' ').toLowerCase();
      group.items = Array.prototype.slice.call(group.querySelectorAll('.library-items li'));
      group.items.forEach(function (li) { li.searchText = textOf(li); });
    });
    entries.forEach(function (li) {
      li.searchText = (textOf(li) + ' ' + li.dataset.strategy).toLowerCase();
    });

    // Every word of the search has to appear somewhere (in any order).
    function words() {
      return search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    }
    function matches(text, terms) {
      return terms.every(function (w) { return text.indexOf(w) !== -1; });
    }
    function plural(n, one, many) {
      return n.toLocaleString('en-US') + ' ' + (n === 1 ? one : many);
    }

    function applyFilters() {
      var terms = words();
      var strategy = strategySelect.value;
      var byFormat = {};
      var total = 0;
      var shownItems = 0;
      var shownFunds = 0;
      function tally(type) {
        byFormat[type] = (byFormat[type] || 0) + 1;
        total++;
      }

      if (view === 'funds') {
        groups.forEach(function (group) {
          var inScope = (strategy === '*' || group.dataset.strategy === strategy) && matches(group.searchText, terms);
          var n = 0;
          group.items.forEach(function (li) {
            if (inScope) tally(li.dataset.format);
            var on = format === '*' || li.dataset.format === format;
            li.hidden = !on;
            if (on) n++;
          });
          var visible = inScope && (format === '*' || n > 0);
          group.hidden = !visible;
          if (visible) {
            shownFunds++;
            shownItems += n;
          }
          // The format counts in the Library column light up the chosen format.
          group.querySelectorAll('.library-format').forEach(function (chip) {
            chip.classList.toggle('is-dim', format !== '*' && chip.dataset.format !== format);
          });
          // A format filter shows every matching item; otherwise long lists start collapsed.
          var list = group.querySelector('.library-items');
          var more = group.querySelector('[data-library-more]');
          if (list && more) {
            var collapsed = format === '*' && !list.dataset.expanded;
            list.classList.toggle('is-collapsed', collapsed);
            more.hidden = !collapsed;
          }
        });
        count.textContent = plural(shownFunds, 'fund', 'funds') + ' · ' + plural(shownItems, 'item', 'items');
      } else {
        var funds = {};
        entries.forEach(function (li) {
          var inScope = (strategy === '*' || li.dataset.strategy === strategy) && matches(li.searchText, terms);
          if (inScope) tally(li.dataset.format);
          var visible = inScope && (format === '*' || li.dataset.format === format);
          li.hidden = !visible;
          if (visible) {
            shownItems++;
            funds[li.dataset.name] = true;
          }
        });
        years.forEach(function (h) {
          var list = h.nextElementSibling;
          h.hidden = list.hidden = !list.querySelector('.library-entry:not([hidden])');
        });
        shownFunds = Object.keys(funds).length;
        count.textContent = plural(shownItems, 'item', 'items') + ' from ' + plural(shownFunds, 'fund', 'funds');
      }

      formatButtons.forEach(function (b) {
        var n = b.dataset.format === '*' ? total : (byFormat[b.dataset.format] || 0);
        b.querySelector('[data-n]').textContent = n;
        b.classList.toggle('is-empty', n === 0 && b.dataset.format !== format);
      });
      var filtered = terms.length > 0 || strategy !== '*' || format !== '*';
      clearButton.hidden = !filtered;
      shareButton.hidden = !filtered && view === 'funds' && currentSort === DEFAULT_SORT;
      empty.hidden = (view === 'funds' ? shownFunds : shownItems) > 0;
      strategySelect.classList.toggle('is-active', strategy !== '*');
      writeUrl();
    }

    function press(buttons, attr, value) {
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset[attr] === value)); });
    }
    function setView(value) {
      view = value;
      press(viewButtons, 'view', value);
      table.hidden = value !== 'funds';
      feed.hidden = value !== 'library';
      applyFilters();
    }
    function setFormat(value) {
      format = value;
      press(formatButtons, 'format', value);
      applyFilters();
    }
    function resetFilters() {
      search.value = '';
      strategySelect.value = '*';
      setFormat('*');
    }

    // Sorting the fund table. Number columns (library size) compare as numbers; blanks always sink.
    function sortBy(button, forced) {
      var th = button.closest('th');
      var col = th.cellIndex;
      var current = th.getAttribute('aria-sort');
      var dir = forced || (current ? (current === 'ascending' ? 'descending' : 'ascending') : (button.dataset.sortFirst || 'ascending'));
      var name = (th.className.match(/col-(\w+)/) || [])[1];
      currentSort = name + '-' + (dir === 'ascending' ? 'asc' : 'desc');
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
      var numeric = group0Cell(col).dataset.sortType === 'number';
      groups.sort(function (a, b) {
        var ka = key(a, col), kb = key(b, col);
        var order = (!ka || !kb) ? (!ka) - (!kb) : sign * (numeric ? Number(ka) - Number(kb) : compare(ka, kb));
        return order || compare(key(a, 1), key(b, 1));
      });
      groups.forEach(function (group) { table.appendChild(group); });
      writeUrl();
    }
    function group0Cell(col) {
      return groups[0].rows[0].cells[col];
    }

    // Shareable views: ?view=library&q=...&strategy=Quant&type=Podcast&sort=items-desc. Only these parameters are
    // rewritten, so utm_* tags stay for Google Analytics (and are left out of "Copy link to this view").
    var OWN_PARAMS = ['view', 'q', 'strategy', 'type', 'sort'];
    function viewParams() {
      var params = new URLSearchParams(location.search);
      Array.from(new Set(params.keys())).forEach(function (k) { if (OWN_PARAMS.indexOf(k) === -1) params.delete(k); });
      return params.toString();
    }
    var ready = false;
    function writeUrl() {
      if (!ready || !window.history || !history.replaceState) return;
      var params = new URLSearchParams(location.search);
      OWN_PARAMS.forEach(function (k) { params.delete(k); });
      if (view !== 'funds') params.set('view', view);
      if (search.value.trim()) params.set('q', search.value.trim());
      if (strategySelect.value !== '*') params.set('strategy', strategySelect.value);
      if (format !== '*') params.set('type', format);
      if (currentSort !== DEFAULT_SORT) params.set('sort', currentSort);
      var qs = params.toString();
      var url = location.pathname + (qs ? '?' + qs : '') + location.hash;
      if (url !== location.pathname + location.search + location.hash) history.replaceState(history.state, '', url);
    }
    function readUrl() {
      var params = new URLSearchParams(location.search);
      if (params.get('q')) search.value = params.get('q');
      var strategy = params.get('strategy');
      if (strategy && Array.prototype.some.call(strategySelect.options, function (o) { return o.value === strategy; })) strategySelect.value = strategy;
      var type = params.get('type');
      if (type && Array.prototype.some.call(formatButtons, function (b) { return b.dataset.format === type; })) {
        format = type;
        press(formatButtons, 'format', type);
      }
      var sort = params.get('sort') || DEFAULT_SORT;
      var m = sort.match(/^(\w+)-(asc|desc)$/);
      var th = m && table.querySelector('thead th.col-' + m[1]);
      if (!th || !th.querySelector('button[data-sort]')) {
        m = DEFAULT_SORT.match(/^(\w+)-(asc|desc)$/);
        th = table.querySelector('thead th.col-' + m[1]);
      }
      sortBy(th.querySelector('button[data-sort]'), m[2] === 'asc' ? 'ascending' : 'descending');
      return params.get('view') === 'library' ? 'library' : 'funds';
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

    function setExpanded(group, open) {
      group.classList.toggle('is-open', open);
      group.rows[1].hidden = !open;
      group.querySelector('.tracker-toggle').setAttribute('aria-expanded', String(open));
    }

    // Open the fund named in the URL hash (e.g. #balyasny), switching to the fund view and clearing filters if
    // it is hidden.
    function openFromHash() {
      var id = decodeURIComponent(location.hash.slice(1));
      var group = id && document.getElementById(id);
      if (!group || group.parentNode !== table) return;
      if (view !== 'funds') setView('funds');
      if (group.hidden) resetFilters();
      if (!group.classList.contains('is-open')) track('library_fund_open', { company: group.dataset.name });
      setExpanded(group, true);
      group.scrollIntoView({ block: 'start' });
      group.classList.remove('is-highlighted');
      void group.offsetWidth; // restart the highlight animation
      group.classList.add('is-highlighted');
    }

    // The whole summary row toggles its details, except links and text selections.
    table.addEventListener('click', function (e) {
      var copy = e.target.closest('[data-copy-link]');
      if (copy) {
        copyText(location.origin + location.pathname + '#' + copy.dataset.copyLink, copy, 'Link copied');
        track('library_share', { link_type: 'fund', company: copy.closest('tbody').dataset.name });
        return;
      }
      var more = e.target.closest('[data-library-more]');
      if (more) {
        var list = more.previousElementSibling;
        list.dataset.expanded = 'true';
        list.classList.remove('is-collapsed');
        more.hidden = true;
        return;
      }
      var row = e.target.closest('.tracker-row');
      if (!row || e.target.closest('a')) return;
      if (!e.target.closest('button') && String(window.getSelection())) return;
      var opening = !row.parentNode.classList.contains('is-open');
      if (opening) track('library_fund_open', { company: row.parentNode.dataset.name });
      setExpanded(row.parentNode, opening);
    });

    // A fund's name in the All items view opens that fund in the table.
    feed.addEventListener('click', function (e) {
      var link = e.target.closest('.library-entry-fund');
      if (!link || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      var hash = link.getAttribute('href');
      if (location.hash === hash) openFromHash(); else location.hash = hash;
    });

    // Links followed to a podcast, talk or post: which fund, and what kind of item.
    function trackLink(e) {
      if (e.type === 'auxclick' && e.button !== 1) return;
      var a = e.target.closest('a[href]');
      if (!a || !/^https?:$/.test(a.protocol) || a.hostname === location.hostname) return;
      var item = a.closest('.library-entry, .library-items li');
      var group = a.closest('tbody');
      var fund = item && item.classList.contains('library-entry') ? item.dataset.name : group && group.dataset.name;
      if (!fund) return;
      var type = item ? item.dataset.format.toLowerCase() : /(^|\.)linkedin\.com$/.test(a.hostname) ? 'linkedin'
        : /(^|\.)(x|twitter)\.com$/.test(a.hostname) ? 'x'
        : a.closest('.col-latest') ? 'latest' : 'website';
      track('library_link_click', { company: fund, link_type: type, link_domain: a.hostname.replace(/^www\./, ''), link_url: a.href });
    }
    root.addEventListener('click', trackLink);
    root.addEventListener('auxclick', trackLink);

    var searchTimer;
    var lastTerm = '';
    search.addEventListener('input', function () {
      applyFilters();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        var term = search.value.trim().toLowerCase();
        if (term.length > 1 && term !== lastTerm) track('view_search_results', { search_term: term });
        lastTerm = term;
      }, 1500);
    });
    search.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        search.value = '';
        applyFilters();
      }
    });
    document.addEventListener('keydown', function (e) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        search.focus();
      }
    });
    strategySelect.addEventListener('change', function () {
      if (strategySelect.value !== '*') track('library_filter', { filter_type: 'strategy', filter_value: strategySelect.value });
      applyFilters();
    });
    viewButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        if (button.dataset.view === view) return;
        track('library_filter', { filter_type: 'view', filter_value: button.dataset.view });
        setView(button.dataset.view);
      });
    });
    // Clicking the selected format again goes back to all formats.
    formatButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.dataset.format === format ? '*' : button.dataset.format;
        if (value !== '*') track('library_filter', { filter_type: 'format', filter_value: value });
        setFormat(value);
      });
    });
    sortButtons.forEach(function (button) {
      button.addEventListener('click', function () { sortBy(button); applyFilters(); });
    });
    clearButton.addEventListener('click', resetFilters);
    root.querySelector('[data-library-reset]').addEventListener('click', resetFilters);
    shareButton.addEventListener('click', function () {
      var qs = viewParams();
      copyText(location.origin + location.pathname + (qs ? '?' + qs : ''), shareButton, 'Link copied');
      track('library_share', { link_type: 'view' });
    });
    window.addEventListener('hashchange', openFromHash);

    // Missing favicons (Google's 16px globe) become a tile with the fund's initial; in the item list they're dropped.
    function hue(text) {
      var h = 0;
      for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 360;
      return h;
    }
    root.querySelectorAll('img.tracker-logo').forEach(function (img) {
      var owner = img.closest('tbody, .library-entry');
      var name = owner ? owner.dataset.name : '';
      function swap() {
        if (!img.isConnected) return;
        if (img.closest('.library-entry')) { img.remove(); return; }
        var tile = document.createElement('span');
        tile.className = 'tracker-logo tracker-monogram';
        tile.textContent = img.dataset.initial || '?';
        tile.setAttribute('aria-hidden', 'true');
        tile.style.setProperty('--hue', hue(name));
        img.replaceWith(tile);
      }
      function check() { if (img.naturalWidth && img.naturalWidth <= 16) swap(); }
      img.addEventListener('load', check);
      img.addEventListener('error', swap);
      if (img.complete) { if (img.naturalWidth) check(); else swap(); }
    });
    root.querySelectorAll('.tracker-monogram').forEach(function (tile) {
      tile.style.setProperty('--hue', hue(tile.closest('tbody').dataset.name || ''));
    });

    // Sticky column headers sit just below the sticky toolbar.
    function syncStickyOffset() {
      root.style.setProperty('--tracker-toolbar-height', toolbar.offsetHeight + 'px');
    }
    window.addEventListener('resize', syncStickyOffset);

    toolbar.hidden = false;
    meta.hidden = false;
    root.classList.add('is-enhanced');
    syncStickyOffset();
    var startView = readUrl();
    ready = true;
    setView(startView);
    if (location.hash) openFromHash();
  });
})();
