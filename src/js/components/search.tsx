import 'css/search.scss'
import ManaCost from 'js/components/mana-cost'
import { DBCard, searchCards } from 'js/database'
import { Component, FunctionalComponent, h } from 'preact'

interface Props {
    value?: string
    placeholder?: string

    filter?: string

    onSelect?: (card: DBCard) => void
    onChange?: (card: string) => void
    onKeyDown?: (e: KeyboardEvent) => void
}

interface State {
    value: string
    suggestion: DBCard[]
    selected: number
    open: boolean
}

export default class Search extends Component<Props, State> {

    private _input: HTMLInputElement
    public get input(): HTMLInputElement {
        return this._input
    }

    constructor(props: Props) {
        super(props)

        this.state = {
            value: this.props.value || '',
            suggestion: [],
            selected: 0,
            open: false,
        }
        this.searchCards(this.props.value || '')
            .then(cards => this.setState({
                suggestion: cards,
            }))
    }

    public render() {
        let img: string | undefined
        let cost: JSX.Element | undefined
        const selected = this.state.suggestion[this.state.selected]

        if (selected !== undefined) {
            img = selected.image_url
            if (selected.name === this.state.value) {
                cost = <ManaCost class='mana-cost' cost={selected.mana_cost} />
            }
        }

        return <div class={`search ${this.state.open ? 'open' : ''}`}>
            <div class='screen' onClick={this.blur} />
            <input
                ref={e => this._input = e}
                value={this.state.value}
                placeholder={this.props.placeholder}
                onInput={this.onChange}
                onKeyDown={this.onKeyDown}
                onFocus={this.focus}
            />
            {cost}
            <div class='popup'>
                <div class='names'>
                    {this.state.suggestion.map((card, i) => <CardRow
                        key={card.id}
                        card={card}
                        selected={i === this.state.selected}
                        onMouseMove={this.changeSelection(i)}
                        onClick={this.selectCard(i)}
                    />)}
                </div>
                <img class='selected-card' src={img} />
            </div>
        </div>
    }

    public componentDidUpdate(previousProps: Props) {
        if (this.props.value !== undefined && this.props.value !== previousProps.value) {
            this.setState({ value: this.props.value })
            this.searchCards(this.props.value)
                .then(cards => this.setState({
                    suggestion: cards,
                }))
        }
    }

    private searchCards = async (query: string): Promise<DBCard[]> => {
        let filter = ''
        if (this.props.filter !== undefined) {
            filter = this.props.filter + ' '
        }

        return await searchCards(filter + query)
    }

    private onChange = async (e: Event) => {
        const input = e.target as HTMLInputElement
        const value = input.value

        this.setState({ value: value })

        const cards = await this.searchCards(value)

        this.setState({
            suggestion: cards,
            selected: 0,
        })

        if (this.props.onChange) {
            this.props.onChange(value)
        }
    }

    private onKeyDown = (e: KeyboardEvent) => {
        if (this.props.onKeyDown) {
            this.props.onKeyDown(e)
            if (e.defaultPrevented) {
                return
            }
        }
        switch (e.key) {
            case 'ArrowUp':
                if (this.state.selected > 0) {
                    this.setState({ selected: this.state.selected - 1 })
                }
                break
            case 'ArrowDown':
                if (this.state.selected < this.state.suggestion.length - 1) {
                    this.setState({ selected: this.state.selected + 1 })
                }
                break
            case 'Enter':
                this.selectCard(this.state.selected)()
                break
            case 'Escape':
            case 'Tab':
                this.blur()
                break
        }
    }

    private selectCard(index: number) {
        return () => {
            const selected = this.state.suggestion[index]
            if (selected === undefined) {
                return
            }
            this.setState({
                value: selected.name,
                selected: 0,
                suggestion: [selected],
            })
            this.input.blur()

            if (this.props.onSelect) {
                this.props.onSelect(selected)
            }
        }
    }
    private changeSelection(index: number) {
        return () => {
            if (this.state.selected !== index) {
                this.setState({ selected: index })
            }
        }
    }

    private focus = () => {
        this.setState({ open: true })
    }
    private blur = () => {
        this.setState({ open: false })
        this.input.blur()
    }

}

interface CardRowProps {
    card: DBCard
    selected: boolean
    onMouseMove?: (e: MouseEvent) => void
    onClick?: (e: MouseEvent) => void
}

const CardRow: FunctionalComponent<CardRowProps> = props => {
    let classes = 'row'
    if (props.selected) {
        classes += ' selected'
    }

    return <div
        class={classes}
        onMouseMove={props.onMouseMove}
        onClick={props.onClick}
    >
        <span class='name'>{props.card.name}</span>
        <ManaCost class='mana-cost' cost={props.card.mana_cost} />
    </div>

}
