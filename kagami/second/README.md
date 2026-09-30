# KAGAMI 第2LP（kagami/second）

## 公開するとき
- `index.html` の先頭付近にある **`<meta name="robots" content="noindex">` を1行削除**（直前に ★ 付きのコメントがあります）。
- 正式版にする場合は、`canonical` と `og:url` のURLが公開先と合っているか確認。

## 素材の入れ方（設定は `index.html` 下部の `KAGAMI_CONFIG`）
素材を入れると「準備中」の枠は**自動で消えて**実素材に置き換わります。空のままなら枠のままです。

### HERO動画（`HERO_VIDEO`）
- 置き場所：HEROの写真の枠（スマホは写真のすぐ下にコピーと価格があるため、動画はその枠の中で再生）。
- 尺：60〜90秒。音なし自動再生（ループ）。音ありは「音を出す」ボタン。
- 比率：3:2（横長）を推奨。スマホでは写真と同じ枠に収まります。
- 容量の目安：PC用 〜6MB、スマホ用 〜2.5MB（720px幅・H.264）。`desktop` と `mobile` を別ファイルで。
- 読み込み：ページ表示が終わってから後読み。省データ通信・動きを減らす設定の端末では写真のまま。
- 内容：サービス説明ではなく、ロケット・人と向き合う仕事・算命学への考え方を、自然な言葉で。

### 鑑定書（`REPORT_IMAGES`）
- 置き場所：「90分の流れ」の直後の「90分のあとに、手元に残るもの。」。
- 枚数と役割：1枚目＝表紙（大きく表示）、2枚目＝中身、3枚目＝ページ構成。`caption` に短い説明文。
- サイズ：縦長（A4比率 1:1.414）、幅900px前後のWebP。個人情報は必ず匿名化。
- 説明文の例：表紙「鑑定後にお渡しするPDFの表紙」／中身「鑑定でお話しした内容の一部」／ページ構成「全体のページ構成」。
- 画像の下に出る `caption` のほか、「形式・受け取り・内容」の表は文章側に用意済みです。

## 計測（GA4の測定IDを `GA4_ID` に入れると有効）
cta_click（hero / price / flow / final）、application_start、application_complete（`?applied=1` 付きで戻せる場合）、
section_view（hero / stat_17_4 / price / story / flow_90min / report / voices / faq / final_cta）、scroll_depth（25/50/75/90）、
video_play / video_progress（25/50/75/100）、faq_interaction、testimonial_view。
