# Resume (LaTeX + GitHub Pages)

Personal resume source built with XeLaTeX and published to GitHub Pages.

## Repository Structure

- `hanisntsolo-resume.tex` — main resume source.
- `hanisntsolo-resume.cls` — custom style class.
- `index.html` — landing page with resume download and analytics hooks.
- `output/` — generated artifacts (PDF output target).
- `assets/` — logo/assets used in resume.

## Local Build

### Option 1: latexmk (recommended)

```bash
latexmk -xelatex -output-directory=output hanisntsolo-resume.tex
```

### Option 2: xelatex directly

```bash
xelatex -output-directory=output hanisntsolo-resume.tex
```

Generated PDF:

- `output/hanisntsolo-resume.pdf`

## Deploy to GitHub Pages

In your workflow, compile the `.tex` file and publish `output/`.

Example key settings:

- `root_file: hanisntsolo-resume.tex`
- `compiler: xelatex`
- `args: -output-directory=output`
- copy `index.html` into `output/`

## Analytics for Resume Downloads

You asked a great question: **yes, analytics needs a central counter/data sink**.

You have 3 practical options:

1. **Hosted analytics (fastest): GoatCounter (already wired)**
   - `index.html` now includes your GoatCounter script snippet.
   - Download button logs a dedicated event path: `/resume-download`.
   - The landing page also attempts to fetch and show total download clicks from GoatCounter's counter endpoint.

2. **Custom endpoint (most control)**
   - If you want full ownership, replace the `loadDownloadCount()` fetch URL and event writer with your own API endpoint.
   - Store counts in Redis/PostgreSQL (or serverless DB) and expose your own dashboard.

3. **Cloudflare Analytics / edge logs (low effort, coarse-grained)**
   - Useful for total traffic trends.
   - Not as explicit as click-level events unless custom event collection is added.

### Recommended setup for your use case

- GoatCounter is now the default tracking implementation in this repo.
- If public counter endpoint is restricted, you will still see exact numbers in GoatCounter dashboard.
- For guaranteed public count display on the page, either enable GoatCounter public counter endpoint or add a tiny proxy endpoint.

## Notes

- Resume content is tuned for one-page density; avoid adding long paragraphs.
- Prefer impact-oriented bullets (action + tech + measurable outcome).
