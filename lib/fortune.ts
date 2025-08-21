export type Gender = "kadin" | "erkek" | "belirtmek-istemiyorum";

function capFirst(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// 10 farklı şablon seti (paragraflar). Şablonlar adı/yası cümleye yedirir.
const TEMPLATES: ((p: { name: string; gender: Gender; age: number }) => string[])[] = [
  ({ name, gender, age }) => [
    `Merhaba ${capFirst(name)}, fincanının genel enerjisi sakin ama derin. Özellikle son ${Math.max(
      1,
      Math.round(age / 10)
    )} ayda biriktirdiklerin, bugünlerde netlik kazanıyor.`,
    `Aşk tarafında, kalp bölgesinde belirgin bir iz var: duygular netleştikçe güvende hissedeceksin. Ancak ufak bir kıskançlık enerjisi de görünüyor; sınırlarını nazikçe hatırlatman faydalı olur.`,
    `Kariyerde yeni bir adımın eşiğindesin. Bitirmeyi ertelediğin bir iş ya da dosya varsa, onu kapatman sana hız kazandıracak. Görüşmelere açık ol; bir teklif haberi görünüyor.`,
    `Maddi tarafta küçük ama düzenli bir artış ihtimali var. Harcamalarında planlı davranman bu artışı kalıcı kılacak.`,
    `Sağlıkta stres kaynaklı dalgalanmalar görünüyor. Kısa yürüyüşler ve su tüketimi dengeyi toparlar.`,
    `Genel tavsiye: niyetini netleştir. Net niyet net cevabı çağırır.`,
  ],
  ({ name }) => [
    `${capFirst(name)}, fincanda ince ama belirgin bir yol çizgisi var: yolun açılıyor.`,
    `Aşkta iletişim belirleyici. Duyduğunu değil, anladığını teyit ettiğinde yanlış anlamalar dağılacak.`,
    `Kariyerde otorite figürüyle (yönetici/müşteri) uyumlu bir konuşma görünüyor. Gündemi sen belirlersen sonuç lehine döner.`,
    `Finansal olarak beklediğin bir haber var; kısa vadede olumlu, orta vadede temkinli ol.`,
    `Rutinini sadeleştir; uykunu düzene oturtursan enerji seviyen yükselir.`,
    `Küçük bir jest/paylaşım, beklemediğin bir kapıyı açacak.`,
  ],
  ({ name, age }) => [
    `${capFirst(name)}, fincanın orta bölümünde net bir sembol: dönüşüm. ${age} yaş tecrüben bu değişimi yönetebileceğini söylüyor.`,
    `Aşkta “eski bir konu” yeniden gündeme gelebilir; bu kez sınırların daha net.`,
    `Kariyerde bir öğrenme eğrisi var. Kısa bir eğitim/mini kurs büyük fark yaratır.`,
    `Parada dağınık küçük kalemler toparlandığında rahatlama geliyor.`,
    `Sağlıkta bedenin “esneme/nefes” istiyor; 10 dakikalık rutin bile iyi gelecek.`,
    `Not: Zihin dağınıklığını tek sayfalık bir hedef listesi çok hızlı toparlar.`,
  ],
  ({ name }) => [
    `${capFirst(name)}, fincanın kenarında nazik bir kıvrım: sabırla bekledikçe doğru haber geliyor.`,
    `Aşk hayatında adım karşıdan gelirse şaşırma; kişiler netleşiyor.`,
    `Kariyer: Gizli destek var. Arka planda senin için konuşulan olumlu cümleler görünüyor.`,
    `Maddi: Eski bir alacak/ödenek konusu çözüme yaklaşmış.`,
    `Sağlık: Ritmi bozmayan küçük molalar iyi gelir.`,
    `Tavsiye: “Hayır” deme becerin, “evet” kadar kıymetli.`,
  ],
  ({ name }) => [
    `${capFirst(name)}, genel titreşimin temiz ve akışkan. Şans penceresi açık.`,
    `Aşk: Ufak bir jestin gönül kapısını araladığı bir sahne var.`,
    `Kariyer: Plan–uygulama dengesini kurduğunda hızlanıyorsun.`,
    `Para: Birikim için doğru zaman; küçük ama istikrarlı.`,
    `Sağlık: Şeker/uyku dengesine dikkat.`,
    `Tavsiye: Gününü 3 önceliğe indir; fazlası motivasyonu dağıtıyor.`,
  ],
  ({ name }) => [
    `${capFirst(name)}, fincanda iki ayrı yol birleşiyor: iki seçenekten biri netleşecek.`,
    `Aşk: Duyguyu saklamak yerine basit cümlelerle paylaşman sihirli etki yapar.`,
    `Kariyer: Takım içinde görünürlüğün artıyor; bir sunum/fikir öne çıkacak.`,
    `Para: Gereksiz abonelik/masraf temizliği rahatlatır.`,
    `Sağlık: Omuz/ense gerginliği için esneme tavsiye.`,
    `Tavsiye: Zaman kutuları (time-blocking) odaklarını keskinleştirir.`,
  ],
  ({ name }) => [
    `${capFirst(name)}, fincanda zarif bir halka: tamamlanma enerjisi.`,
    `Aşk: Eski bir kırgınlığa içten bir cümle iyi gelebilir.`,
    `Kariyer: Küçük bir görev büyüyüp fırsata dönebilir; sahiplen.`,
    `Para: Kısa vadede denge, orta vadede artış.`,
    `Sağlık: Su + kısa yürüyüş = berrak zihin.`,
    `Tavsiye: “Şimdi ne yapabilirim?” sorusu tıkanıklığı açar.`,
  ],
  ({ name }) => [
    `${capFirst(name)}, fincanda ince bir merdiven: adım adım yükseliş.`,
    `Aşk: İki yönlü çaba dengeyi kurar; küçük sürpriz etkili.`,
    `Kariyer: Yeni bir araç/otomasyon seni hızlandırır.`,
    `Para: Harcama notları kontrol hissini geri verir.`,
    `Sağlık: Rutinini 1 küçük alışkanlıkla güçlendir.`,
    `Tavsiye: Net hedef + sakin tempo.`,
  ],
  ({ name }) => [
    `${capFirst(name)}, fincanda ışık alan bir köşe: umut yenileniyor.`,
    `Aşk: Kırılgan bir konu nazikçe şifalanıyor.`,
    `Kariyer: Geç gelen bir onay/haber yakın.`,
    `Para: Minik bir ek gelir olasılığı var.`,
    `Sağlık: Nefes çalışması gevşetir.`,
    `Tavsiye: Erteleme yerine 10 dakikalık başlangıç yap.`,
  ],
  ({ name }) => [
    `${capFirst(name)}, fincanda dalga gibi akış: değişimle uyum içindesin.`,
    `Aşk: İfade edilen duygular karşılık buluyor.`,
    `Kariyer: Odaklandığın alan verim yazıyor; dağıtmamaya dikkat.`,
    `Para: Planlı kaldıkça sürpriz harcama korkutmaz.`,
    `Sağlık: Ekran molası göz/baş rahatlatır.`,
    `Tavsiye: Şükran listesi morali yükseltir.`,
  ],
];

// Verilen index'e göre şablon seçip (0–9), 6 paragraflık fal döndür.
export function buildFortune(name: string, gender: Gender, age: number, index: number) {
  const safeName = (name || "Misafir").trim().slice(0, 40);
  const i = Math.abs(index) % TEMPLATES.length;
  const paragraphs = TEMPLATES[i]({ name: safeName, gender, age });
  return paragraphs;
}
