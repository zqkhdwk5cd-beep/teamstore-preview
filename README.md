# TEAM STORE – Case Preview System

نظام معاينة الجرابات لمتجر Team Store.

## التشغيل

```bash
npm install
npm run dev
```

- **Customer App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

## الميزات

### Customer App
- اختيار موديل الآيفون (11 → 16 Pro Max)
- سكان باركود بالكاميرا (ZXing)
- إدخال يدوي كبديل
- عرض صورة المعاينة النهائية (pre-generated)
- واجهة عربية RTL فاخرة
- PWA جاهز للتثبيت
- حماية من in-app browsers

### Admin Pipeline
- إضافة / تعديل / حذف منتجات
- رفع صورة الجراب الأصلية
- إزالة الخلفية تلقائياً
- توليد صورة المعاينة (الجراب على الجهاز)
- إعادة المعالجة في أي وقت

## الأكواد التجريبية
- `1` → جراب سيليكون أزرق
- `2` → جراب سيليكون وردي
- `3` → جراب سيليكون أبيض

## البنية
```
src/
  app/
    page.tsx          ← Customer App
    admin/            ← Admin Panel
    api/products/     ← REST API
  components/
    customer/         ← Customer UI
    admin/            ← Admin UI
  lib/
    db.ts             ← JSON database
    imageProcessor.ts ← Sharp pipeline
  types/index.ts      ← TypeScript types
data/db.json          ← Database
public/
  mockups/            ← Phone base images
  uploads/            ← Generated images
```
