# Kroki właściciela: domena, GitHub Pages, narzędzia dla webmasterów (Z-04)

Autor: sesja AS (M8-formalnosci, build, zakres zawężony do Z-04, Z-07 i Z-20), 27.11.2026. Zadanie właściciela, które z tego wynika, to Z-05 (DNS i Pages). Kroki 9–10 przypadają na Z-63, czyli po Z-62.
Każdą ścieżkę w interfejsie przepisałem ze strony pomocy, którą przeczytałem 27.11.2026 około 14:35 UTC (surowy tekst pobrany przez `curl`; strony pomocy wyszukiwarki Bing wyrenderowane w Chromium). Cytaty podaję dosłownie. Czego strona pomocy nie opisuje, jest oznaczone **[DO USTALENIA]** i ma osobny krok sprawdzenia.

## Stan dziś (pomiar 27.11.2026, 14:35 UTC, z chmury)

| Co | Wynik | Jak zmierzone |
|---|---|---|
| `http://techniqueatlas.com` i `http://www.techniqueatlas.com` | `302 Found`, przekierowanie na `https://techniqueatlas-com.l.ink/` (strona parkingowa) | `curl -sI`, `curl -w %{redirect_url}` |
| Serwery nazw | `curitiba`, `fortaleza`, `maceio`, `salvador` `.ns.porkbun.com`, czyli DNS prowadzi Porkbun | zapytanie DNS (NS) |
| Apex `techniqueatlas.com` | A → `207.207.210.23`, `.36`, `.50` (adresy Porkbun, nie GitHub) | zapytanie DNS (A) |
| `www` | CNAME → `uixie.porkbun.com.` | zapytanie DNS (CNAME) |
| TXT na apex | `google-site-verification=0MK7…mxI` oraz `v=spf1 include:_spf.porkbun.com ~all` | zapytanie DNS (TXT) |
| `https://lkarwowski494.github.io/techniqueatlas/` | `404` | `curl -sI` |
| Repo `lkarwowski494/techniqueatlas` | publiczne, `has_pages: false` (Pages wyłączone) | API GitHub, repozytorium |

Ważne: na domenie **już jest** rekord TXT weryfikacji Google. Ktoś zaczął albo skończył weryfikację w Search Console. **Nie usuwaj go** (krok 9), podobnie jak rekordu SPF (`v=spf1…`), który dotyczy poczty, a nie strony.

## Kolejność i czas

1–3 GitHub (weryfikacja domeny, źródło Pages, własna domena) → 4–6 Porkbun (zdjęcie parkingu, rekordy) → 7 sprawdzenie → 8 „Enforce HTTPS” (do 24 h później) → 9–10 wyszukiwarki (weryfikacja od razu, mapa witryny dopiero po Z-62).
Twój czas: ok. 25 min na kroki 1–7, potem czekanie na DNS i certyfikat (do 24 h) i 2 min na krok 8. Kroki 9–10 to ok. 20 min w Z-63.
Dlaczego GitHub jest przed DNS: GitHub pisze: „Make sure you add your custom domain to your GitHub Pages site before configuring your custom domain with your DNS provider. Configuring your custom domain with your DNS provider without adding your custom domain to GitHub could result in someone else being able to host a site on one of your subdomains.” (źródło G1).

## Krok 1. GitHub: weryfikacja domeny na koncie (ok. 5 min, czekanie do 24 h)

Źródło G2. Weryfikacja odbywa się w ustawieniach **profilu**, nie repozytorium: „If you don't see the options described below, make sure you're in your Profile settings, not your repository settings.”
1. W prawym górnym rogu dowolnej strony GitHub kliknij swoje zdjęcie profilowe, potem **Settings**.
2. Na pasku bocznym, w sekcji „Code, planning, and automation”, kliknij **Pages**.
3. Po prawej kliknij **Add a domain**.
4. W polu „What domain would you like to add?” wpisz `techniqueatlas.com` i wybierz **Add domain**.
5. Pod „Add a DNS TXT record” GitHub poda nazwę i wartość rekordu. Nazwa ma postać `_github-pages-challenge-lkarwowski494`. Dodaj ten rekord w Porkbun (krok 1a), a potem wróć tutaj.
6. Po zmianie DNS kliknij **Verify**. Jeśli opuściłeś stronę: wróć do Pages w ustawieniach profilu, przy domenie kliknij menu, potem **Continue verifying** i **Verify**.
7. Rekordu TXT nie usuwaj: „To make sure your custom domain remains verified, keep the TXT record in your domain's DNS configuration.”

Czas: „Wait for your DNS configuration to change, this may be immediate or take up to 24 hours.”
Zakres: „When you verify a domain, any immediate subdomains are also included in the verification.” Weryfikacja `techniqueatlas.com` chroni więc także `www`.
**[DO USTALENIA] K1:** założyłem, że `lkarwowski494` to konto osobiste. Dla organizacji ścieżka jest inna (G2, „Verifying a domain for your organization site”): Organizations → organizacja → Settings → Pages. Sprawdzisz to w kroku 1.1: jeśli w Settings profilu nie ma „Pages”, napisz.

### Krok 1a. Porkbun: rekord TXT dla GitHub

Źródło P2 (otwieranie edycji DNS):
1. Zaloguj się. Pojawi się ekran **Domain Management** (jeśli jesteś już zalogowany: **ACCOUNT** w prawym górnym rogu → **Domain Management**).
2. Przy `techniqueatlas.com` otwórz listę **Details** po prawej i kliknij ikonę edycji obok **DNS Records**.
3. W górnej części okna „Manage DNS Records” dodaj rekord. Type: TXT. Host: część nazwy przed domeną, czyli `_github-pages-challenge-lkarwowski494`. Answer: wartość od GitHub. Potem **Add**.

**[DO USTALENIA] K2:** strona P2 opisuje pola na przykładzie typu „A - Address record” i podaje, że Host to sama nazwa poddomeny („Host: "www"”). Dokładnej etykiety typu TXT na liście Porkbun nie przeczytałem. Wybierz pozycję zaczynającą się od „TXT”.
Sprawdzenie (polecenie z G2): `dig _github-pages-challenge-lkarwowski494.techniqueatlas.com +nostats +nocomments +nocmd TXT`. Możesz też napisać do koordynatora, a sesja sprawdzi to z chmury.

## Krok 2. GitHub: źródło Pages „GitHub Actions” (2 min)

Źródło G3, sekcja „Publishing with a custom GitHub Actions workflow”:
1. Na GitHub otwórz repozytorium `lkarwowski494/techniqueatlas`.
2. Pod nazwą repozytorium kliknij **Settings** (jeśli nie widać zakładki: menu rozwijane → Settings).
3. Na pasku bocznym, w sekcji „Code, planning, and automation”, kliknij **Pages**.
4. W „Build and deployment”, pod „Source”, wybierz **GitHub Actions**.
5. GitHub zaproponuje szablony workflowów. **Pomiń je.** Repo ma już `.github/workflows/pages.yml`: „If you already have a workflow to publish your site, you can skip this step.”

Ten krok niczego nie publikuje. `pages.yml` uruchamia się tylko ręcznie (`workflow_dispatch`, `.github/workflows/pages.yml:5-6`), a pierwsza publikacja to osobna zgoda (Z-50, decyzja P-3).
Opcja z G3, do decyzji: „We recommend that you add a deployment protection rule so that only the default branch can deploy to this environment.” (środowisko `github-pages`). Nie jest wymagana do Z-05.

## Krok 3. GitHub: własna domena `www.techniqueatlas.com` (2 min)

Źródło G1, sekcja „Configuring a subdomain”, i G3:
1. W tym samym miejscu (repo → **Settings** → **Pages**), pod „Custom domain”, wpisz `www.techniqueatlas.com` i kliknij **Save**.
2. Pliku CNAME nie dodajemy: „If you are publishing from a custom GitHub Actions workflow, no CNAME file is created, and any existing CNAME file is ignored and is not required.”

Dlaczego `www`, a nie apex: `config.json` → `domena` ma `https://www.techniqueatlas.com` („adres z www” to decyzja bez zmian w planie). G1 opisuje skutek: „if you configure www.example.com as the custom domain for your site, and you have GitHub Pages DNS records set up for the apex and www domains, then example.com will redirect to www.example.com.”
**[DO USTALENIA] K3:** strony pomocy nie mówią, czy pole „Custom domain” jest dostępne przed pierwszym wdrożeniem (Z-51). Jeśli go nie widać:
- napisz do koordynatora;
- kroki 4–6 (DNS) zrób dopiero po wpisaniu domeny, bo wymaga tego cytat z G1 wyżej;
- weryfikacja z kroku 1 i tak chroni domenę przed przejęciem przez inne konta.

## Krok 4. Porkbun: zdjęcie parkingu i przekierowania (5 min)

Dziś obie nazwy kierują przekierowaniem 302 na stronę parkingową, a rekordy wskazują serwery Porkbun (tabela „Stan dziś”).
1. **Przekierowanie (URL Forwarding).** Źródło P3: Domain Management → przy domenie **Details** → ikona edycji obok **URL Forwarding**. Na dole okna jest sekcja „Current Forwards”. Usuń wpisy dla `techniqueatlas.com` i `www`.
   **[DO USTALENIA] K4:** P3 opisuje tworzenie przekierowania i sekcję „Current Forwards”, ale nie przycisk usuwania. Nie wiem też na pewno, czy parking `…l.ink` ustawia URL Forwarding, czy inna usługa Porkbun. Jeśli w „Current Forwards” nic nie ma, zrób krok 4.2 i sprawdź (krok 7), czy 302 zniknęło. Jeśli nie zniknęło, napisz do koordynatora.
2. **Stare rekordy.** Źródło P2, krok 3: „On the Manage DNS Records screen, scroll down to the bottom section labeled "Current Records". Locate any ALIAS, CNAME, or A records that are currently pointing at the wrong web server (or Porkbun's default "pixie.porkbun.com" records). Click the trash can icons to the right of the old records to remove them.”
   Usuń:
   - rekordy A/ALIAS dla apex (Host pusty), które wskazują `207.207.210.x` albo `*.porkbun.com`;
   - CNAME `www` → `uixie.porkbun.com`.

   **Nie usuwaj** TXT: `google-site-verification=…`, `v=spf1…` ani TXT z kroku 1a.
   To samo mówi G1: „If your DNS provider automatically sets a default record, remove it before continuing.” G4 ostrzega, że dodatkowe rekordy blokują certyfikat: „Any additional A, AAAA, ALIAS, ANAME records with the @ host … may prevent the HTTPS certificate from generating.”

## Krok 5. Porkbun: apex `techniqueatlas.com` → GitHub Pages (5 min)

Źródło P2, krok 4 (pola), i G1 (wartości). Dodaj 4 rekordy, każdy osobno:
- Type: „A - Address record”;
- Host: pusty („For the second record, you'll repeat the same steps as above, only the Host field will be left blank.”);
- Answer: kolejno `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.

Po każdym rekordzie kliknij **Add**.
Opcjonalnie (IPv6, G1): 4 rekordy AAAA z Host pustym: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`. G1 zaleca A razem z AAAA, nie samo AAAA.
Nie używaj rekordu z gwiazdką: „We strongly recommend that you do not use wildcard DNS records, such as *.example.com.” (G1)

## Krok 6. Porkbun: `www` → `lkarwowski494.github.io` (2 min)

Źródło G1: „create a CNAME record that points www.example.com to <user>.github.io”. Także: „Do not point the CNAME record to the unique *.pages.github.io subdomain shown in your repository's GitHub Pages settings.” Wskazuje się nazwę konta, nie repozytorium.
Dodaj jeden rekord: Type: CNAME; Host: `www`; Answer: `lkarwowski494.github.io`; potem **Add**.
Druga droga z P1 (Quick DNS Config): w oknie „MANAGE DNS RECORDS” w sekcji Quick DNS Config przycisk „Github”, a w oknie „ADDITIONAL DNS REQUIREMENTS” Host `www` i Answer z nazwą konta. **Rekomenduję kroki 5–6 ręcznie**, bo P1 nie podaje, jakie rekordy apex tworzy przycisk („reconfigure your domain's DNS records”). Ręcznie każdy rekord jest zgodny z tabelą G1.
Na końcu zamknij okno ikoną „X” w prawym górnym rogu (P2, krok 5).

## Krok 7. Sprawdzenie (2 min; zrobi je też sesja z chmury)

Czas według źródeł: Porkbun „Changing A records may take a few minutes to go into effect.” (P2); GitHub „DNS changes can take up to 24 hours to propagate.” (G1).
Polecenia:
- `dig techniqueatlas.com +noall +answer -t A` → cztery adresy `185.199.10x.153` (G1);
- `dig www.techniqueatlas.com +nostats +nocomments +nocmd` → `CNAME lkarwowski494.github.io.`;
- `curl -sI http://www.techniqueatlas.com` → brak przekierowania na `…l.ink`.

Na Windowsie nie ma `dig` (G1: „you can use the Resolve-DnsName PowerShell command”). Możesz też napisać „DNS zrobione” do koordynatora.
Warunek gotowości Z-05 z planu: „curl -sI domeny nie wskazuje parkingu; certyfikat”.
Przed Z-51 strona pod domeną zwróci błąd GitHub (nic nie wdrożono). To spodziewane.

## Krok 8. GitHub: „Enforce HTTPS” (2 min, do 24 h po kroku 3)

Źródło G4 („Enforcing HTTPS for your GitHub Pages site”): repo → **Settings** → **Pages** → pod „GitHub Pages” zaznacz **Enforce HTTPS**.
Czas: „It can take up to 24 hours before this option is available.” (G1)
Gdy certyfikat nie powstaje (G4): „If the process has not completed several minutes after you clicked Save, try clicking Remove next to your custom domain name. Retype the domain name and click Save again.” Po powodzeniu „a check mark is displayed beside your custom domain name.”
**[DO USTALENIA] K5:** G4 nie mówi, czy certyfikat powstaje przed pierwszym wdrożeniem. Jeśli opcji nie ma po 24 h, a DNS jest poprawny (krok 7), sprawdzimy to po Z-51.

## Krok 9. Google Search Console: właściwość domeny (Z-63; 10 min, weryfikacja do 2–3 dni)

Źródła S1 (dodanie właściwości) i S2 (weryfikacja).
0. **Najpierw sprawdź, czy właściwość już jest.** TXT `google-site-verification=…` jest w DNS (tabela „Stan dziś”). Otwórz Search Console i selektor właściwości. S1: „Open the property selector dropdown in any Search Console page”. Jeśli `techniqueatlas.com` jest na liście jako zweryfikowana, przejdź do kroku 9.4.
   **[DO USTALENIA] K6:** kto i kiedy dodał ten rekord; nie sprawdzę tego z chmury.
1. Dodaj właściwość typu **Domain**, wpisując `techniqueatlas.com` bez `www`. S1: „Don't include a www prefix. Domain properties automatically include both www and non-www prefixes”. Także: „A Domain property requires you to verify ownership using DNS record verification”.
2. Weryfikacja przez DNS (S2, „TXT DNS record instructions”): w okienku wybierz TXT, skopiuj wartość i dodaj w Porkbun jak w kroku 1a (Type TXT, Host pusty). S2: „For the Host/Name property, either leave this blank, or set as "@"”. Jeśli wartość jest identyczna z istniejącym rekordem, nie dodawaj drugiego.
3. Kliknij **Verify**. S2: „For manually installed records, it can take up to two or three days for your provider to start serving the record.” Także: „To stay verified, don't remove the DNS record from your provider, even after verification succeeds.”
4. **Mapa witryny dopiero po Z-62.** Dziś `indeksowanie=false` i build nie tworzy map (README, „Stan”). Po Z-62 adres to `https://www.techniqueatlas.com/sitemap.xml` (indeks map, `src/build.mjs:79`; ten sam adres jest w `robots.txt`, `src/build.mjs:80`). S3 („Submit a sitemap”): „Open the Sitemaps report, copy the URL you tested in step 3, paste it into the Add a new sitemap box in the Sitemaps report, then click Submit.” Przed zgłoszeniem S3 każe sprawdzić dostępność: „running a live URL inspection and checking that Page fetch is "Successful"”.

## Krok 10. Druga wyszukiwarka: Bing Webmaster Tools (Z-63; 5 min)

Źródło B1 („Add and Verify site”).
**Rekomendacja: import z Google Search Console po kroku 9.** B1: „If you have a verified Google Search Console account, you can import the settings … along with the property directly into Bing.” Także: „the selected sites will be added and get automatically verified in Bing Webmaster Tools.” Mapy też przechodzą: „any new sitemap found on your Search Console account will also be imported automatically”.
Kompromis: Bing dostaje dostęp do odczytu konta Search Console. B1 opisuje, jak go odebrać: „you can choose Disconnect option present beside the account details in the Profile section”. Bez nowego rekordu DNS.
Druga opcja: ręcznie („Add your site manually: You can also add sites manually by entering the URL in the input box and clicking add.”), weryfikacja przez DNS. **Uwaga, korekta planu:** w B1 DNS w Bing to **CNAME**, nie TXT („Add CNAME record to DNS: … type the verification code (series of numbers and letters) we have provided you with”), albo automatyczne „DNS auto verification” przez Domain Connect, jeśli Porkbun jest obsługiwany.
**[DO USTALENIA] K7:** B1 nie podaje dokładnej nazwy i wartości CNAME; poda je ekran Bing. Nie wiem, czy Porkbun obsługuje Domain Connect w Bing.
Mapę witryny, jeśli nie przejdzie z importu, zgłasza się w module „Sitemaps” (pozycja menu na stronie pomocy B1). **[DO USTALENIA] K8:** strona pomocy „Sitemaps” (B2) wyrenderowała się 27.11 bez treści. Ścieżkę zgłoszenia mapy w Bing przeczytamy w Z-63.

## Luki [DO USTALENIA] i kto je zamyka

| ID | Luka | Kiedy wyjdzie | Kto |
|---|---|---|---|
| K1 | Konto osobiste czy organizacja (ścieżka weryfikacji) | krok 1.1 | właściciel (patrzy, czy w Settings profilu jest „Pages”) |
| K2 | Etykieta typu TXT w Porkbun | krok 1a | właściciel (wybór z listy) |
| K3 | Czy pole „Custom domain” jest dostępne przed pierwszym wdrożeniem | krok 3 | właściciel; jeśli nie: koordynator przestawia DNS po Z-51 |
| K4 | Jak usunąć przekierowanie / co ustawia parking `…l.ink` | krok 4.1 | właściciel + sprawdzenie `curl` po kroku 7 |
| K5 | Certyfikat przed pierwszym wdrożeniem | krok 8 | sprawdzenie po 24 h albo po Z-51 |
| K6 | Kto dodał istniejący TXT weryfikacji Google | krok 9.0 | właściciel (selektor właściwości) |
| K7 | Dokładny CNAME Bing / Domain Connect | krok 10 (gdy bez importu) | ekran Bing |
| K8 | Ścieżka zgłoszenia mapy w Bing | Z-63 | sesja Z-63 (strona pomocy) |

## Źródła (przeczytane 27.11.2026)

| ID | Adres | Uwagi |
|---|---|---|
| G1 | https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site | apex, www, tabela rekordów, wildcard, Enforce HTTPS |
| G2 | https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages | weryfikacja domeny na koncie |
| G3 | https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site | źródło „GitHub Actions”, CNAME przy workflow |
| G4 | https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https | Enforce HTTPS, certyfikat, dodatkowe rekordy |
| P1 | https://kb.porkbun.com/article/64-how-to-connect-your-domain-to-github-pages | Quick DNS Config „Github”; „Last updated on July 16, 2026” |
| P2 | https://kb.porkbun.com/article/54-how-to-manage-dns-records (tytuł: „Pointing Your Domain to Hosting With A Records”) | pola Type/Host/Answer, usuwanie starych rekordów; „Last updated on October 4, 2025” |
| P3 | https://kb.porkbun.com/article/39-how-to-set-up-url-forwarding | URL Forwarding, „Current Forwards”; „Last updated on July 29, 2026” |
| S1 | https://support.google.com/webmasters/answer/34592?hl=en | właściwość Domain, bez www |
| S2 | https://support.google.com/webmasters/answer/9008080?hl=en | weryfikacja TXT, czas 2–3 dni |
| S3 | https://support.google.com/webmasters/answer/7451001?hl=en | raport Sitemaps, „Add a new sitemap” |
| B1 | https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b | import z Search Console, metody weryfikacji (strona renderowana JS, odczyt przez Chromium) |
| B2 | https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed | wyrenderowana bez treści artykułu: luka K8 |

## Stan pracy sesji AS (punkt przekazania)

| Zadanie | Stan | Plik |
|---|---|---|
| Z-04 | zrobione (ten plik) | `docs/strona-kroki-wlasciciela.md` |
| Z-07 | zrobione; czeka na Z-08 (pytanie u koordynatora) | `docs/znaki-towarowe-metoda.md` |
| Z-20 | zrobione (projekty do recenzji Z-23) | `docs/teksty/prawne/` |
