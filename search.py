import urllib.request, re, json
req = urllib.request.Request('https://html.duckduckgo.com/html/?q=yenepoya+university+logo+png+transparent', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
print(re.findall(r'//[^"]+\.png', html))
