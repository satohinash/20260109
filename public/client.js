// アプリケーションのロジックを定義
const app = {
    isLoggedIn: false,
    isRegisterPage: false,
    message: '',
    user: { username: '', password: '' },
    items: [],
    searchTag: '',
    form: { id: null, name: '', count: 1, image: '', tagInput: '' },

    // 初期化
    init() {
        console.log("App mounted!");
    },

    // ユーザー登録
    async register() {
        console.log("Registering:", this.user.username);
        this.message = "登録中...";
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(this.user)
            });
            const data = await res.json();
            if (res.ok) {
                alert("登録が完了しました！ログインしてください。");
                this.isRegisterPage = false;
                this.message = "";
            } else {
                this.message = data.msg || "登録に失敗しました";
            }
        } catch (e) {
            this.message = "サーバーに接続できません";
        }
    },

    // ログイン
    async login() {
        console.log("Logging in:", this.user.username);
        this.message = "ログイン中...";
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(this.user)
            });
            const data = await res.json();
            if (res.ok) {
                this.isLoggedIn = true;
                this.message = "";
                this.fetchItems();
            } else {
                this.message = data.msg || "ログインに失敗しました";
            }
        } catch (e) {
            this.message = "サーバーに接続できません";
        }
    },

    logout() {
        this.isLoggedIn = false;
        this.user = { username: '', password: '' };
        this.message = "";
    },

    // アイテム取得
    async fetchItems() {
        const tag = this.searchTag.replace('#', '').trim();
        const res = await fetch(`/api/items?tag=${tag}`);
        this.items = await res.json();
    },

    // アイテム保存
    async saveItem() {
        if (!this.form.name) return alert("名前を入力してください");

        const tags = this.form.tagInput
            .split(/[ 　,]/)
            .filter(t => t.startsWith('#'))
            .map(t => t.replace('#', ''));

        const payload = { 
            id: this.form.id,
            name: this.form.name,
            count: this.form.count,
            image: this.form.image,
            tags: tags 
        };

        await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        this.resetForm();
        this.fetchItems();
    },

    uploadImage(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // --- リサイズ処理の開始 ---
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 200; // 最大幅を200pxに設定（KV制限に収まりやすいサイズ）
                const scale = MAX_WIDTH / img.width;
                
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scale;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // 画質を0.7(70%)に落としてJPEG形式で出力（容量をさらに節約）
                const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                
                this.form.image = resizedBase64;
                console.log("Resized image size:", Math.round(resizedBase64.length / 1024), "KB");
                // --- リサイズ処理の終了 ---
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    },

    editItem(item) {
        this.form = { 
            ...item, 
            tagInput: item.tags.map(t => '#' + t).join(' ') 
        };
        window.scrollTo(0, 0);
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

// 手動でマウント
PetiteVue.createApp(app).mount("#app");