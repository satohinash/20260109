function ItemApp() {
    return {
        isLoggedIn: false,
        user: { username: '', password: '' },
        items: [],
        searchTag: '',
        form: { id: null, name: '', count: 1, image: '', tagInput: '' },

        async init() {
            // 初期化処理があればここに
        },

        async login() {
            const res = await fetch("/api/login", {
                method: "POST",
                body: JSON.stringify(this.user)
            });
            if (res.ok) {
                this.isLoggedIn = true;
                this.fetchItems();
            }
        },

        uploadImage(e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                this.form.image = event.target.result;
            };
            reader.readAsDataURL(file);
        },

        async fetchItems() {
            const tag = this.searchTag.replace('#', '');
            const res = await fetch(`/api/items?tag=${tag}`);
            this.items = await res.json();
        },

        async saveItem() {
            // タグを配列に変換 (#を消してスペースで区切る)
            const tags = this.form.tagInput
                .split(/[ 　]/)
                .filter(t => t.startsWith('#'))
                .map(t => t.replace('#', ''));

            const payload = { ...this.form, tags };
            await fetch("/api/items", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            this.resetForm();
            this.fetchItems();
        },

        editItem(item) {
            this.form = { 
                ...item, 
                tagInput: item.tags.map(t => '#' + t).join(' ') 
            };
        },

        async deleteItem(id) {
            if (!confirm("削除しますか？")) return;
            await fetch(`/api/items/${id}`, { method: "DELETE" });
            this.fetchItems();
        },

        resetForm() {
            this.form = { id: null, name: '', count: 1, image: '', tagInput: '' };
        }
    };
}