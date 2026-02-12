---
title: "Guide: Publishing & Frontmatter"
description: "Understanding how Potato handles YAML and GitHub pushes."
date: "2026-02-08"
author: "Potato Guide"
draft: true
layout: "post"
---

# Publishing & Frontmatter

Potato CMS is **framework-agnostic**. It doesn't care if you use Hugo, Astro, or Jekyll. It only cares about your `.md` files.

### 1. Dynamic Schema
You can change the fields you see in the editor by visiting **Settings > Content Schema**. Whatever YAML you define there becomes the form you use to write.

### 2. Pushing to GitHub
When you click **Publish**, Potato:
1. Formats your fields into YAML frontmatter.
2. Combines it with your Markdown text.
3. Performs a secure `PUT` request to your GitHub repository.

### 3. File Naming
By default, Potato generates filenames based on your `title` field. You can customize the slug in the sidebar of the editor.

---
*Potato: Small, powerful, and grows anywhere.*
