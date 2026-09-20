# canon/voice.yaml

```yaml
language: en                 # prose language of the decks
tone: [clear, direct, warm]  # 3–5 adjectives
banned:
  - term: guarantee
    use_instead: "informs your decision"
    why: "legal: the product informs, it does not assure"
    strict: false            # true = also banned inside <Quote>
required:
  - when: "a slide states a price"
    text: "Prices exclude VAT."   # a reviewer checks this; the eval does not
tagline: "Know before you sell."
glossary:
  - { internal: KYB, customer: "business verification" }
```

Questions that fill it, in order: tone words → "words you never want to see in a
deck, and what you'd say instead" → "anything legal makes you say, and when" →
tagline → formality (first names? formal you?) → internal jargon customers
wouldn't understand.

`banned[].term` is matched as a whole word, case-insensitive, on titles, closings
and bodies of every slide. Keep it to real risks: legal exposure, brand voice,
competitor names. Ten terms is a lot.
