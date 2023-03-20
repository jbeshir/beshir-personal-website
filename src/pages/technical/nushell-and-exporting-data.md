---
layout: ../../layouts/technical.astro
title: "A trial run of nushell: Exporting my Manifold Markets data via API"
description: "A trial run of nushell via putting together a script to pull all my personal data from an API"
date: "2023-03-19"
categories:
  - "nushell"
  - "api"
---

One of my routine habits is to, every month or so, export all my data from the messaging and social media platforms I use, as well as GitHub and my task lists, and store them locally where I can back them up myself- so if any of my accounts ever did upset some automated suspicious behaviour detection algorithm I'd not lose years of important conversations and data.

Some of the big services offer their own exporter or automated GDPR tool which does what I need, but for others I use my own exporter scripts that run over my important data and retrieve it. These normally take existing tools which contain API bindings, and either patch them or tie them together in shell scripts.

Recently I wanted to export my data from Manifold Markets, and having just installed nushell, decided to try to solve this, learn a little nushell, and review it as a shell scripting environment by writing a nushell script that talked directly to [their API](https://docs.manifold.markets/api), using the included support for HTTP and manipulating structured data to crawl the markets I had bet on and dump them into files without using or writing any API bindings.

This went well, so I've written it up to share my early experiences with nushell and an example of what you can do with it. This is quick work in a new language- the script I threw together is [here](/releases/manifold-markets-export/export.nu) but don't expect it to be too idiomatic. I expect to use nushell in future when I need to poke an API and mess with what it gives back.

### First Steps

First step was retrieving the start of my bets list and taking a look at it in the shell:

```
> http get -H [Authorization redacted-api-key] $'https://manifold.markets/api/v0/bets?username=jbeshir'
```
```
╭─────┬──────────────────────┬──────────────────────┬────────────────────────────────────────────────────────────┬─────╮
│   # │          id          │         fees         │                           fills                            │ ... │
├─────┼──────────────────────┼──────────────────────┼────────────────────────────────────────────────────────────┼─────┤
│   0 │ pR0M3MpWZb20yN54pDKX │ ╭──────────────┬───╮ │ ╭───┬────────┬────────┬───────────────┬──────────────╮     │ ... │
│     │                      │ │ creatorFee   │ 0 │ │ │ # │ amount │ shares │   timestamp   │ matchedBetId │     │     │
│     │                      │ │ platformFee  │ 0 │ │ ├───┼────────┼────────┼───────────────┼──────────────┤     │     │
│     │                      │ │ liquidityFee │ 0 │ │ │ 0 │    300 │ 349.17 │ 1679272748224 │              │     │     │
│     │                      │ ╰──────────────┴───╯ │ ╰───┴────────┴────────┴───────────────┴──────────────╯     │     │
│   1 │ CAd4oCwuUyoS7X3FVFL5 │ ╭──────────────┬───╮ │ ╭───┬────────┬────────┬────────┬───────────────┬─────╮     │ ... │
│     │                      │ │ creatorFee   │ 0 │ │ │ # │ amount │ isSale │ shares │   timestamp   │ ... │     │     │
│     │                      │ │ platformFee  │ 0 │ │ ├───┼────────┼────────┼────────┼───────────────┼─────┤     │     │
│     │                      │ │ liquidityFee │ 0 │ │ │ 0 │ -29.22 │ true   │    -65 │ 1679145125344 │ ... │     │     │
│     │                      │ ╰──────────────┴───╯ │ ╰───┴────────┴────────┴────────┴───────────────┴─────╯     │     │
│   2 │ TTaLNir6PpAp1lvszB1Q │ ╭──────────────┬───╮ │ ╭───┬────────┬────────┬───────────────┬──────────────╮     │ ... │
│     │                      │ │ creatorFee   │ 0 │ │ │ # │ amount │ shares │   timestamp   │ matchedBetId │     │     │
│     │                      │ │ platformFee  │ 0 │ │ ├───┼────────┼────────┼───────────────┼──────────────┤     │     │
│     │                      │ │ liquidityFee │ 0 │ │ │ 0 │     75 │ 214.05 │ 1679144920189 │              │     │     │
│     │                      │ ╰──────────────┴───╯ │ ╰───┴────────┴────────┴───────────────┴──────────────╯     │     │
```

This is a start, although too deep a structure to be readable. I could drop it into a variable with:

```
> let items = http get -H [Authorization redacted-api-key] $'https://manifold.markets/api/v0/bets?username=jbeshir'
```

And then look at an individual item with:

```
> $items.1
```
```
╭───────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ id            │ CAd4oCwuUyoS7X3FVFL5                                                                                 │
│               │ ╭──────────────┬───╮                                                                                 │
│ fees          │ │ creatorFee   │ 0 │                                                                                 │
│               │ │ platformFee  │ 0 │                                                                                 │
│               │ │ liquidityFee │ 0 │                                                                                 │
│               │ ╰──────────────┴───╯                                                                                 │
│               │ ╭───┬────────┬────────┬────────┬───────────────┬──────────────╮                                      │
│ fills         │ │ # │ amount │ isSale │ shares │   timestamp   │ matchedBetId │                                      │
│               │ ├───┼────────┼────────┼────────┼───────────────┼──────────────┤                                      │
│               │ │ 0 │ -29.22 │ true   │    -65 │ 1679145125344 │              │                                      │
│               │ ╰───┴────────┴────────┴────────┴───────────────┴──────────────╯                                      │
│ amount        │ -29.22                                                                                               │
│ isAnte        │ false                                                                                                │
│ shares        │ -65                                                                                                  │
│ userId        │ ojKdYJvKvdZiWDEyBmEab7kZXYI3                                                                         │
│ outcome       │ NO                                                                                                   │
│ isFilled      │ true                                                                                                 │
│ userName      │ John Beshir                                                                                          │
│ probAfter     │ 0.60                                                                                                 │
│ contractId    │ c5R92yCWt1eKunnN93Fa                                                                                 │
│ loanAmount    │ -3.40                                                                                                │
│ probBefore    │ 0.50                                                                                                 │
│ createdTime   │ 1679145125344                                                                                        │
│ isCancelled   │ false                                                                                                │
│ isChallenge   │ false                                                                                                │
│ orderAmount   │ -29.22                                                                                               │
│ isRedemption  │ false                                                                                                │
│ userUsername  │ jbeshir                                                                                              │
│ userAvatarUrl │ https://firebasestorage.googleapis.com/v0/b/mantic-markets.appspot.com/o/user-images%2FJohnBeshir%2F │
│               │ Work%20Avatar%20-%202021-08-01.png?alt=media&token=72ec0636-153a-4467-b93c-41811dc09182              │
╰───────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────╯
```

Much more meaningful!

### Pagination

This is unfortunately not all my data; the endpoint has a limit of 1000 items. To get the next 1000, I need to make a second request, setting `before` to the ID of the last item I retrieved from the last request. This is a lot prettier than trying to do this in bash; `$items.999.id` gives me what I want. But what if the limit changes? `$items | length` gives me the length, so `($items | get (($items | length) - 1)).id` gives me the ID of the last element. A little verbose but works.

I need to set an optionally added query parameter using this on later requests; I can use the nushell if statement to build a string for one:

```
let beforeStr = (if (($items | length) != 0) {
    $'&before=(($items | get (($items | length) - 1)).id)'
} else {
    ''
})
```

And then I just need to accumulate the retrieved items in a loop, by declaring items mutably with `mut items = []`, hitting the generated URL to get the next batch of items, appending them with `$items = $items | append $newItems` and setting a mutable flag on whether to continue based on whether `$newItems` had a length at the limit. Make limit manually set (so it won't change surprisingly) and I get:

```
let apiKey = 'api-key-goes-here'
let limit = 1000

mut items = []
mut hasMore = true
while ($hasMore) {
    echo $'Retrieving more bets...'
    let limitStr = $'&limit=($limit)'
    let beforeStr = (if (($items | length) != 0) {
        $'&before=(($items | get (($items | length) - 1)).id)'
    } else {
        ''
    })

    let newItems = http get -H [Authorization $apiKey] $'https://manifold.markets/api/v0/bets?username=jbeshir($beforeStr)($limitStr)'
    $items = ($items | append $newItems)

    $hasMore = (($newItems | length) == $limit)
}
```

As the starting point for my export script.

### Saving the data

With the structured data retrieved, it can be converted back to JSON using `to json` and saved with `save`. I use the `-f` flag to overwrite so new runs can extend an existing file- my backups are versioned so I don't want to separately keep many versions of the export.

```
$items | to json | save -f bets.json
```

### Retrieving further data

The retrieved bets themselves aren't very meaningful without the context of the markets they were made on. Each of the bets keeps the ID for their market in the `contractId` field, so I can retrieve this by extending the script to iterate over the items, and hit a couple more endpoints each:

```
mkdir 'markets'
$items | each { |it|
    echo $'Exporting market for bet ($it.id)'
    let contractId = $it.contractId
    mkdir $'markets/($contractId)'


    let market = http get -H [Authorization $apiKey] $'https://manifold.markets/api/v0/market/($contractId)'
    $market | to json | save -f $'markets/($contractId)/market.json'

    let comments = http get -H [Authorization $apiKey] $'https://manifold.markets/api/v0/comments?contractId=($contractId)'
    $comments | to json | save -f $'markets/($contractId)/comments.json'
}
```

This completes my script; I can run it with `nu export.nu` and get my export as part of my monthly backups.

### Results

The final script is [here](/releases/manifold-markets-export/export.nu). This is thrown together quickly, so don't expect it to be too idiomatic.

This was a lot easier and more pleasant than scripting external tools together in bash and doesn't rely on installing a service-specific tool into my local environment. It could fluidly expand upwards from running individual requests from my shell to explore an API, to a script that did what I needed and could take its secrets from the environment.

I'm looking forward to using it in future, testing it with more complex/tricky APIs with more parameters, and seeing where I run into more limits.