
# Resume Project

This repository contains the LaTeX source files for my resume and is set up to automatically compile and deploy the resume to GitHub Pages using GitHub Actions.

## Steps to Set Up

### 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/hanisntsolo/resume.git
cd resume
```

### 2. Set Up GitHub Actions Workflow

Create a GitHub Actions workflow to compile the LaTeX document and deploy it to GitHub Pages.

Create a file `.github/workflows/deploy.yml` with the following content:

```yaml
name: Compile LaTeX document

on:
  push:
    branches:
      - master

permissions:
  contents: write  # Explicitly set the permission for the GITHUB_TOKEN

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Set up LaTeX
        uses: xu-cheng/latex-action@v2
        with:
          root_file: dhirendra_resume-openfont.tex
          compiler: xelatex
          args: -output-directory=output  # Specify output directory
          
      - name: Copy index.html to output
        run: cp index.html output/index.html  # Copy index.html to output directory
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./output  # Directory containing your compiled PDF
          destination_dir: ./  # Directory where the site will be hosted
```

### 3. Enable GitHub Pages

Go to the repository settings on GitHub and navigate to "Settings" > "Pages". Ensure the source is set to the `gh-pages` branch and the folder is `/ (root)`.

### 4. Verify File Placement

Ensure the compiled PDF is located at:

```
https://hanisntsolo.github.io/resume/dhirendra_resume-openfont.pdf
```

### 5. Create a Redirect `index.html`

Create an `index.html` file to redirect from `https://hanisntsolo.github.io/resume` to the PDF file.

```bash
# Ensure you are on the gh-pages branch
git checkout gh-pages

# Navigate to the resume directory
cd resume

# Create the index.html file
echo '<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=dhirendra_resume-openfont.pdf">
    <title>Redirecting...</title>
</head>
<body>
    <p>Redirecting to <a href="dhirendra_resume-openfont.pdf">dhirendra_resume-openfont.pdf</a></p>
</body>
</html>' > index.html

# Add and commit the file
git add index.html
git commit -m "Add index.html for redirecting to renamed PDF"

# Push the changes
git push origin gh-pages
```

### Access the PDF

- **Direct PDF URL:** `https://hanisntsolo.github.io/resume/dhirendra_resume-openfont.pdf`
- **Redirect URL:** `https://hanisntsolo.github.io/resume`

### Clearing Browser Cache

If you face any issues with redirection, try clearing your browser cache or accessing the URL in an incognito window.

### Summary

This setup ensures that the LaTeX document for your resume is automatically compiled and deployed to GitHub Pages. The compiled PDF is accessible at the specified URL, with an `index.html` file ensuring a smooth redirection.

By following these steps, you can maintain and update your resume efficiently.



Deedy-Resume
=========================

A **one-page**, **two asymmetric column** resume template in **XeTeX** that caters particularly to an **undergraduate Computer Science** student.
As of **v1.2**, there is an option to choose from two templates:

1. **MacFonts** - uses fonts native to OSX - *Helvetica*, *Helvetica Neue* (and it's Light and Ultralight versions) and the CJK fonts *Heiti SC*, and *Heiti TC*. The EULA of these fonts prevents distribution on Open Source.
2. **OpenFonts** - uses free, open-source fonts that resemble the above - *Lato* (and its various variants) and *Raleway*.

It is licensed under the Apache License 2.0.

## Motivation

Common LaTeX resume-builders such as [**moderncv**](http://www.latextemplates.com/template/moderncv-cv-and-cover-letter)  and the [**friggeri-cv**](https://github.com/afriggeri/cv) look great if you're looking for a multi-page resume with numerous citations, but usually imperfect for making a thorough, single-page one. A lot of companies today search resumes based on [keywords](http://www.businessinsider.com/most-big-companies-have-a-tracking-system-that-scans-your-resume-for-keywords-2012-1) but at the same time require/prefer a one-page resume, especially for undergraduates. 

This template attempts to **look clean**, highlight **details**, be a **single page**, and allow useful **LaTeX templating**.

## Preview

### OpenFonts
![alt tag](https://raw.githubusercontent.com/deedydas/Deedy-Resume/master/OpenFonts/sample-image.png)

### MacFonts
![alt tag](https://raw.githubusercontent.com/deedydas/Deedy-Resume/master/MacFonts/sample-image.png)

## Dependencies

1. Compiles only with **XeTeX** and required **BibTex** for compiling publications and the .bib filetype.
2. Uses fonts that are usually only available to **Mac** users such as Helvetica Neue Light.

## Availability

1. MacFonts version - [as an online preview](http://debarghyadas.com/resume/debarghya-das-resume.pdf) and [as a direct download](https://github.com/deedydas/Deedy-Resume/raw/master/MacFonts/deedy_resume.pdf)
2. OpenFonts version - [as a direct download](https://github.com/deedydas/Deedy-Resume/raw/master/OpenFonts/deedy_resume-openfont.pdf)
3. **Overleaf**.com (formerly **WriteLatex**.com) (v1 fonts/colors changed) - [compilable online](https://www.writelatex.com/templates/deedy-resume/sqdbztjjghvz#.U2H9Kq1dV18)
4. **ShareLatex**.com (v1 fonts changes) - [compilable online](https://www.sharelatex.com/templates/cv-or-resume/deedy-resume)

## Changelog
### v1.2
 1. Added publications in place of societies.
 2. Collapsed a portion of education.
 3. Fixed a bug with alignment of overflowing long last updated dates on the top right. 

### v1.1
 1. Fixed several compilation bugs with \renewcommand
 2. Got Open-source fonts (Windows/Linux support)
 3. Added Last Updated
 4. Moved Title styling into .sty
 5. Commented .sty file.

## TODO
1. Merge OpenFont and MacFonts as a single sty with options.
2. Figure out a smoother way for the document to flow onto the next page.
3. Add styling information for a "Projects/Hacks" section.
4. Add location/address information
5. Fix the hacky 'References' omission outside the .cls file in the MacFonts version.
6. Add various styling and section options and allow for multiple pages smoothly.

## Known Issues:
1. Overflows onto second page if any column's contents are more than the vertical limit
2. Hacky space on the first bullet point on the second column.
3. Hacky redefinition of \refname to omit 'References' text for publications in the MacFonts version.
4. Github Pages is being used for serving the generated pdf's.

## License
    Copyright 2014 Debarghya Das

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
