import { currentUser, firestore, onAuthChange } from 'js/firebase'
import Model, { field } from './model'

export default class Deck extends Model {
    @field()
    public name: string = ''
    @field()
    public cards: string = ''
    @field()
    public keyImageURL: string = ''

    @field()
    public userID: string = ''
    @field()
    public userName: string = ''

    @field({ readonly: true })
    public createdAt: firebase.firestore.Timestamp | undefined

    @field({ readonly: true })
    public updatedAt: firebase.firestore.Timestamp | undefined

    protected collection = firestore.collection('decks')

    protected saving(): void {
        const user = currentUser()
        if (user) {
            this.userID = user.uid
        }
    }
}
