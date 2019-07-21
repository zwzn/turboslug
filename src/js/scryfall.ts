export interface Response<T> {
    object: 'list'
    has_mode: boolean
    data: T[]
}

export interface CardResponse extends Response<Card> {
    total_cards: number
    next_page: string
}

export type Card = NormalCard | TransformCard

export interface BaseCard {
    object: 'card'
    id: string
    oracle_id: string
    multiverse_ids: number[]
    tcgplayer_id: number
    name: string
    lang: string
    released_at: string
    uri: string
    scryfall_uri: string
    highres_image: boolean
    cmc: number
    type_line: string
    color_indicator: string[]
    color_identity: string[]
    legalities: { [format: string]: string }
    games: string[]
    reserved: boolean
    foil: boolean
    nonfoil: boolean
    oversized: boolean
    promo: boolean
    reprint: boolean
    variation: boolean
    set: string
    set_name: string
    set_type: string
    set_uri: string
    set_search_uri: string
    scryfall_set_uri: string
    rulings_uri: string
    prints_search_uri: string
    collector_number: string
    digital: boolean
    rarity: string
    card_back_id: string
    artist: string
    border_color: string
    frame: string
    full_art: boolean
    textless: boolean
    booster: boolean
    story_spotlight: boolean
    prices: { [type: string]: string }
    related_uris: { [service: string]: string }
    purchase_uris: { [service: string]: string }
}

interface NormalCard extends BaseCard {
    layout: 'normal'

    artist: string
    colors: string[]
    illustration_id: string
    image_uris: ImageURIs
    mana_cost: string
    name: string
    oracle_text: string
    power?: string
    toughness?: string
    type_line: string,
}
interface TransformCard extends BaseCard {
    layout: 'transform'

    card_faces: Array<{
        object: 'card_face'
        artist: string
        colors: string[]
        illustration_id: string
        image_uris: ImageURIs
        mana_cost: string
        name: string
        oracle_text: string
        power: string
        toughness: string
        type_line: string,
    }>
}

interface ImageURIs {
    art_crop: string
    border_crop: string
    large: string
    normal: string
    png: string
    small: string,
}

interface Set {
    object: 'set'
    id: string
    code: string
    tcgplayer_id: number
    name: string
    uri: string
    scryfall_uri: string
    search_uri: string
    released_at: string
    set_type: string
    card_count: number
    digital: boolean
    foil_only: boolean
    block_code: string
    block: string
    icon_svg_uri: string
}

export interface CardSymbol {
    object: 'card_symbol',
    symbol: string,
    loose_variant: null,
    english: string,
    transposable: boolean,
    represents_mana: boolean,
    appears_in_mana_costs: boolean,
    cmc: number,
    funny: boolean,
    colors: string[],
    gatherer_alternates: string[],
}

function serialize(obj: object, prefix?: string) {
    const str: string[] = []
    for (const [p, v] of Object.entries(obj)) {
        const k = prefix ? prefix + '[' + p + ']' : p

        if (v !== null && typeof v === 'object') {
            str.push(serialize(v, k))
        } else {
            str.push(encodeURIComponent(k) + '=' + encodeURIComponent(v))
        }

    }
    return str.join('&')
}

export async function search(query: string): Promise<CardResponse> {
    const uri = 'https://api.scryfall.com/cards/search?' + serialize({
        order: 'cmc',
        q: query,
    })
    return fetch(uri).then(r => r.json())

}
export async function allCards(): Promise<Card[]> {
    return fetch('scryfall-oracle-cards.json').then(r => r.json())

}

export async function sets(): Promise<Response<Set>> {
    return fetch('https://api.scryfall.com/sets').then(r => r.json())
}

export async function set(code: string): Promise<Set> {
    return fetch('https://api.scryfall.com/sets/' + encodeURIComponent(code)).then(r => r.json())
}
