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

$items | to json | save -f bets.json

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