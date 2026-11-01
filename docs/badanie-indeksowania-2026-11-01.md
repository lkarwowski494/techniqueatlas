# Badanie: infrastruktura strony a indeksowanie w Google (01.11.2026)

Zlecenie: właściciel 01.11.2026 — ustawić infrastrukturę tak, żeby później nie zepsuć indeksowania. Badacz merytoryczny.
Wszystkie strony przeczytane 01.11.2026 (data odczytu przy każdej pozycji taka sama). Cytaty najwyżej 2 zdania, w oryginale.
Szczebel źródeł: dokumentacja Google Search Central, GitHub Docs i Cloudflare Docs to dokumentacja dostawców usług (szczebel 4 hierarchii z CLAUDE.md aplikacji, ale dla zachowania własnej usługi to źródło pierwotne). Obserwacja zachowania serwera (jedno żądanie) — oznaczona „obserwacja”.

## 1. Meta refresh 0 s + canonical a przekierowanie stałe

**Odpowiedź: tak, z zastrzeżeniem.** Google traktuje natychmiastowy meta refresh jak przekierowanie stałe; opóźniony — jak tymczasowe. Zaleca jednak przekierowanie serwerowe, a meta refresh tylko gdy platforma go nie pozwala (tak jest na GitHub Pages, pkt 2). Canonical na stronie przekierowania wskazujący cel to dodatkowy silny sygnał w tę samą stronę.

- „Google Search interprets instant meta refresh redirects as permanent redirects.” — https://developers.google.com/search/docs/crawling-indexing/301-redirects, sekcja o meta refresh (tabela: natychmiastowy / opóźniony); strona z 14.04.2026.
- „we recommend that you use a permanent server-side redirect whenever possible.” oraz meta refresh „may be a viable alternative” gdy serwerowe są niemożliwe — tamże.
- Rodzaje: stałe — „Show the new redirect target in search results”; tymczasowe — „Show the source page in search results” — tamże, tabela rodzajów.
- JavaScript: „Only use JavaScript redirects if you can't do server-side or meta refresh redirects.” — tamże.
- Sygnały: przekierowanie „A strong signal that the target of the redirect should become canonical”, `rel="canonical"` — też „A strong signal” — https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls, „Comparison of canonicalization methods”; strona z 10.07.2026.
- Przy przenosinach witryny Google wymienia przekierowania po stronie klienta jako „last resort” — https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes; strona z 20.08.2026.

Wniosek dla repo: `src/pages.mjs:20` (`content="0;url=…"`) i `:203` (canonical na cel) są zgodne z dokumentacją. Status: **ustalone** (dokumentacja Google wprost).
[OTWARTE] Dokumentacja nie mówi, czy adres w `url=` ma być bezwzględny; dziś jest względny (`relUrl`, `src/pages.mjs:202`). Wariant bezpieczniejszy bez kosztu: adres bezwzględny (canonical i tak jest bezwzględny — Google wymaga tego dla canonical: „Use absolute paths rather than relative paths”, consolidate-duplicate-urls, „Best practices”).

## 2. GitHub Pages: przekierowania 301, nagłówki, domena, HTTPS, www

- **301 dla pojedynczych ścieżek i własne nagłówki:** w przeczytanej dokumentacji GitHub Pages nie ma takiego mechanizmu (przeczytane: About GitHub Pages, About custom domains, Managing a custom domain, Securing with HTTPS — żadna nie opisuje przekierowań ścieżek ani nagłówków). Udokumentowane przekierowania to tylko apex ↔ www i HTTP → HTTPS. Status: brak w dokumentacji = nie da się na tym polegać; zgodne z obecnym założeniem docs/54 pkt 2 („Strona nie wyśle własnych nagłówków HTTP”). Wniosek: `X-Robots-Tag` i 301 per ścieżka niedostępne → meta robots i meta refresh.
- **www vs apex:** „GitHub Pages will automatically create redirects between the domains” (gdy DNS ustawiony dla obu) i „We recommend always using a `www` subdomain, even if you also use an apex domain.” — https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages oraz …/managing-a-custom-domain-for-your-github-pages-site (sekcja o apex i www). Kod tego przekierowania nie jest w dokumentacji podany.
- **Workflow a plik CNAME:** przy publikacji własnym workflow „no `CNAME` file is created, and any existing `CNAME` file is ignored and is not required.” — managing-a-custom-domain…; domenę ustawia się w ustawieniach Pages repo.
- **Weryfikacja domeny:** „We recommend verifying your custom domain prior to adding it to your repository.” (ochrona przed przejęciem) — tamże.
- **HTTPS:** „You can enforce HTTPS for your GitHub Pages site to transparently redirect all HTTP requests to HTTPS.”; certyfikat Let's Encrypt po pozytywnym sprawdzeniu DNS; opcja „Enforce HTTPS” może być dostępna dopiero po 24 h — https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https, „Enforcing HTTPS…” i managing-a-custom-domain….
- **github.io → własna domena:** dokumentacja tego NIE opisuje (żadna z czterech stron). **Obserwacja** (jedno żądanie, 01.11.2026): `https://jekyll.github.io/jekyll/` → `301 Moved Permanently`, Location `http://jekyllrb.com/` (witryna projektowa z własną domeną). Status: **jedno źródło (obserwacja)**, [OTWARTE] potwierdzić `curl -sI` w przebiegu dowodowym, w tym czy ścieżka `/techniqueatlas/pl/…` przechodzi na `/pl/…`.
- **Ukośnik końcowy na Pages** (`/pl/exercises/x` → `/x/`): [OTWARTE] nie znaleziono w dokumentacji; sprawdzić `curl -sI` w przebiegu dowodowym.

## 3. Cloudflare Pages jako darmowa alternatywa

- `_redirects`: kody „301, 302, 303, 307, 308”, domyślnie 302 („302 is used as the default status code”) — trzeba jawnie pisać 301. Limit: „2,000 static redirects and 100 dynamic redirects, for a combined total of 2,100 redirects”, 1000 znaków na regułę; „Redirects are always followed, regardless of whether or not an asset matches the incoming request.” — https://developers.cloudflare.com/pages/configuration/redirects/ (Structure; Surpass limits); strona z 25.08.2026. Placeholder (`/:lang/exercises/stary/ /:lang/exercises/nowy/ 301`) liczy się jako dynamiczne (limit 100).
- `_headers`: „You may define up to 100 header rules.”, 2000 znaków na linię; przykład `X-Robots-Tag: noindex` dla `https://:project.pages.dev/*` w sekcji „Prevent your workers.dev URLs showing in search results” — https://developers.cloudflare.com/pages/configuration/headers/; strona z 25.08.2026. Nie znaleziono informacji, że podglądy dostają noindex automatycznie.
- **Limity (krytyczne):** „Cloudflare Pages sites can contain up to 20,000 files on the Free plan.”, plik ≤ 25 MiB, 500 buildów/mies., 100 domen na projekt — https://developers.cloudflare.com/pages/platform/limits/ (Files, File size, Builds, Custom domains); strona z 05.09.2026. Workers Static Assets: 20 000 plików na wersję (Free), 100 000 (Paid) — https://developers.cloudflare.com/workers/platform/limits/, „Static Assets”; strona z 29.10.2026.
  - Skutek: 35 języków × 709 stron ćwiczeń = 24 815 plików HTML samych ćwiczeń (docs/54 pkt 3) — **przekracza limit planu darmowego**. Przy 2 językach (pl, en) mieści się z zapasem. GitHub Pages nie ma udokumentowanego limitu liczby plików (limit 1 GB, docs/54 pkt 2).
- **Konto i DNS:** domena główna (apex) musi być strefą Cloudflare: „you will need to add your site as a Cloudflare zone” i musi być „a zone on the Cloudflare account you have created your Pages project on”; subdomena może być CNAME u zewnętrznego DNS („it is not necessary for your site to be a Cloudflare zone”) — https://developers.cloudflare.com/pages/configuration/custom-domains/ (Add a custom apex domain; Add a custom subdomain); strona z 21.04.2026. Wymóg konta Cloudflare — oczywisty z dokumentacji (projekt na koncie).
- Adres `*.pages.dev` zostaje dostępny; przekierowanie produkcyjnego `pages.dev` na domenę przez Bulk Redirects (konto) — tamże, „Disable access to `*.pages.dev` subdomain”.

## 4. Wielojęzyczność

- Struktura: Google porównuje ccTLD, subdomeny, podkatalogi (`example.com/de/`: łatwe ustawienie, niskie utrzymanie) i parametry („Not recommended”); „Google recommends using different URLs for each language version of a page” oraz „Avoid automatically redirecting users from one language version of a site to a different language version of a site.” — https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites (Use different URLs…; tabela URL structure); strona z 10.12.2025. Obecny wybór `/pl/`, `/en/` i `/` bez przekierowania (D9) zgodny.
- hreflang: trzy metody (HTML, nagłówki HTTP, mapa witryny) — „The three methods are equivalent from Google's perspective”, łączenie „there's no benefit in Search”; „Each language version must list itself as well as all other language versions.”; „If two pages don't both point to each other, the tags will be ignored.”; adresy „must be fully-qualified”; x-default — „used when no other language/region matches the user's browser setting”; `es-419` „aren't supported”; „You can't specify the country code by itself.” — https://developers.google.com/search/docs/specialty/international/localized-versions (Methods…; Guidelines for all methods; x-default; Supported codes); strona z 21.09.2026. Dziś repo ma hreflang i w HTML, i w mapach (`src/build.mjs:72`) — dozwolone, bez korzyści, ale ryzyko rozjazdu dwóch źródeł (wniosek własny).
- Canonical przy hreflang: „make sure to specify a canonical page in the same language” — consolidate-duplicate-urls. Zgodne z docs/54 pkt 5.
- Co się psuje przy późniejszej zmianie struktury (np. `/pl/` → `pl.domena`, zmiana kodu języka w adresie): każda zmiana adresu to przenosiny witryny z przekierowaniem każdego adresu (pkt 6), a na Pages tylko meta refresh na stronę × język; zmiana na subdomenę = zmiana „site” w Search Console. Wniosek z pkt 6, nie osobne twierdzenie Google.
- [OTWARTE] `sr-Cyrl`: strona localized-versions nie podaje przykładu kodu pisma dla serbskiego (jedyny przykład pisma: `zh-Hant`/`zh-Hans`); dopasowanie do użytkowników `sr`/`sr-RS` niepotwierdzone.

## 5. Podgląd przed startem: noindex + robots.txt Disallow

- **Tak, to problem.** „For the `noindex` rule to be effective, the page or resource must not be blocked by a robots.txt file” — https://developers.google.com/search/docs/crawling-indexing/block-indexing, „Implementing noindex”; strona z 10.12.2025. Robot nie zobaczy noindex, a strona „can still appear in search results”, np. przez linki z innych stron (tamże).
- robots.txt „is not a mechanism for keeping a web page out of Google”; „If other pages point to your page with descriptive text, Google could still index the URL without visiting the page.” — https://developers.google.com/search/docs/crawling-indexing/robots/intro, „Understand the limitations of a robots.txt file”; strona z 10.12.2025.
- Najpewniej: usunięcie treści albo hasło; „Removing content from your site is the best way to ensure that it won't appear in Google Search” — https://developers.google.com/search/docs/crawling-indexing/control-what-you-share; strona z 21.10.2026. Strona nie omawia witryn testowych wprost.
- Wniosek dla podglądu: (a) najlepiej nie publikować publicznie przed startem (dziś Pages wyłączone — zgodne) albo podgląd lokalny / artefakt CI; (b) jeśli publiczny podgląd jest potrzebny: `noindex` w każdej stronie **bez** `Disallow` w robots.txt (żeby Google zobaczył noindex), bez map witryny, bez linków z innych stron. Ryzyko zaindeksowania adresu podglądu (`*.github.io/techniqueatlas/`, `*.pages.dev`) jako samego URL istnieje przy `Disallow` i linkach zewnętrznych.
- Przełączenie na indeksowanie: zdjąć noindex i Disallow jednocześnie, dodać mapy i zgłosić w Search Console (wniosek). Canonical wskazuje domenę docelową już na podglądzie (`src/pages.mjs:20`, `abs(cfg, …)`), więc nawet zaindeksowany podgląd wskazuje docelowy adres — [OTWARTE] czy canonical do domeny, która jeszcze nie działa, czymś szkodzi; dokumentacja tego nie omawia.

## 6. Zmiana adresów po zaindeksowaniu

- Przekierowania: „we recommend that you use HTTP permanent redirects if possible, such as `301` and `308`”; klient tylko „as a last resort”; „Keep the redirects for as long as possible, generally at least 1 year.”; wprost do celu, łańcuch „ideally no more than 3 and fewer than 5”; po przeniesieniu canonical na nowe adresy i nowa mapa w Search Console; widoczność „may fluctuate temporarily during the move” — https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes; strona z 20.08.2026.
- Narzędzie zmiany adresu tylko przy zmianie domeny lub subdomeny, nie przy zmianie ścieżek, HTTP→HTTPS ani www/bez www — tamże.
- Wniosek dla repo: lock slugów (`src/slugi.mjs`) z wpisem przekierowania jest dobrym mechanizmem; strony przekierowań nie powinny być usuwane wcześniej niż po ok. roku — dziś brak strażnika czasu (wpis w `slug-overrides.json` nie ma daty). Łańcuchy: przekierowanie A→B, potem B→C — `checkSlugLock` mapuje stary slug na id, więc cel jest zawsze bieżącym slugiem (brak łańcucha) — zgodne.

## 7. Ustalić PRZED pierwszym indeksowaniem

| Rzecz | Dlaczego droga później | Źródło |
|---|---|---|
| Domena (zakup, apex czy www jako kanoniczny) | zmiana domeny = przenosiny witryny, przekierowania ≥ 1 rok, wahania widoczności; GitHub zaleca www | site-move…; about-custom-domains… |
| Hosting (Pages / inny) | na Pages zmiana adresów tylko meta refresh; limit plików Cloudflare Free 20 000 | 301-redirects; pages/platform/limits |
| HTTPS wymuszone przed startem | inaczej podwójne adresy http/https | securing-…-with-https |
| Schemat adresów (`/{lang}/exercises/{slug}/`, kody języków w adresie) | każda zmiana = przekierowanie każdej strony × język | site-move…; managing-multi-regional-sites |
| Ukośnik końcowy (z „/”) | adres z i bez „/” to różne adresy (poza głównym) — „treats each URL above separately (and equally)” (blog Google, „To slash or not to slash”, 21.04.2010, https://developers.google.com/search/blog/2010/04/to-slash-or-not-to-slash) | blog Google |
| Małe litery | „Google Search's URL handling is case sensitive” — https://developers.google.com/search/docs/crawling-indexing/url-structure, „Be aware that URLs are case sensitive”; strona z 21.10.2026; myślniki zamiast podkreśleń — tamże | url-structure |
| Canonical bezwzględny, ten sam język | silny sygnał; zmiana później = rekanonikalizacja | consolidate-duplicate-urls |
| Slug (lock przed pierwszą publikacją) | zmiana = przekierowanie | site-move… |
| `x-default` i zestaw hreflang na stronie `/` | brak linków zwrotnych = tagi ignorowane | localized-versions |

## Otwarte pytania

1. Kod HTTP przekierowania `*.github.io/techniqueatlas/…` → własna domena i zachowanie ścieżki — tylko obserwacja innej witryny (301, bez ścieżki projektu). Sprawdzić `curl -sI` w przebiegu dowodowym.
2. Zachowanie Pages dla adresu bez ukośnika końcowego — niesprawdzone.
3. Względny adres w `meta refresh` — dokumentacja milczy.
4. `sr-Cyrl` w hreflang — niepotwierdzone.
5. Canonical na domenę, która jeszcze nie działa (podgląd) — dokumentacja milczy.
6. Czy Workers Static Assets obsługują `_redirects`/`_headers` — strona nie mówi (nieistotne przy limicie 20 000 plików).
