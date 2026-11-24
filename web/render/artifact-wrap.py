"""Turn the saved single-file site into the Artifact format (no page wrapper tags, title first, no mail links)."""
import re
import sys

src = open(sys.argv[1]).read()
cls = re.search(r'<html lang="en-ZA" class="([^"]*)"', src).group(1)
head = src[src.index("<head>") + 6 : src.index("</head>")]
body = src[src.index("<body>") + 6 : src.rindex("</body>")]
style = re.search(r"<style>(.*)</style>", head, re.S).group(1)
old = '''    location.href = "mailto:hello@ustrailers.co.za?subject=" + encodeURIComponent("Trailer brief") + "&body=" + encodeURIComponent(text);'''
assert old in body
body = body.replace(old, '''    let box = form.querySelector(".brief-out");
    if (!box) {
      box = document.createElement("div");
      box.className = "brief-out";
      box.innerHTML = '<p>Your brief is ready. Copy it and send it to hello@ustrailers.co.za or on WhatsApp.</p><textarea readonly rows="8"></textarea><button type="button">Copy my brief</button>';
      form.appendChild(box);
      const b = box.querySelector("button"), ta = box.querySelector("textarea");
      b.addEventListener("click", async () => { try { await navigator.clipboard.writeText(ta.value); b.textContent = "Copied"; } catch { ta.select(); } });
    }
    box.querySelector("textarea").value = text;''')
extra = """
.brief-out { display: grid; gap: 10px; margin-top: 16px; padding: 16px; border: 1px solid var(--line-strong); background: var(--surface); }
.brief-out p { margin: 0; font: 400 15px/1.5 var(--display); color: var(--graphite); }
.brief-out textarea { width: 100%; min-width: 0; font: 400 13px/1.5 var(--mono); color: var(--graphite); background: var(--paper); border: 1px solid var(--line-strong); padding: 10px; }
.brief-out button { justify-self: start; min-height: 44px; padding: 0 18px; background: var(--graphite); color: var(--paper); border: 0; font: 600 12px/1 var(--mono); letter-spacing: .12em; text-transform: uppercase; cursor: pointer; }
:root { color-scheme: dark; }
body { background: var(--paper); color: var(--graphite); }
"""
classes = ", ".join(repr(c) for c in cls.split())
out = f"""<title>US Trailers Website</title>
<meta name="theme-color" content="#0A0B0D">
<script>document.documentElement.classList.add({classes}, "js")</script>
<style>{style}{extra}</style>
{body}"""
open(sys.argv[2], "w").write(out)
print(f"{len(out) / 1e6:.1f} MB")
