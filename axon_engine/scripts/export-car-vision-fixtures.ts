#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { extractComponentsFromArray, sortRecursive } from '../src/utils/helpers';

const WHY_BUY_CARDS = [
  {
    title: 'Registered & Trusted',
    description:
      'We are the most reliable and trustworthy car importers in Bangladesh. The company is registered and member of Bangladesh Reconditioned Vehicles Importers and Dealers Association. Our company fulfilled all the requirements of the government.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Quality Assured',
    description:
      'We only import cars that have auction point, original mileage (ODO reading), and passed the JAAI inspection. This means that the car has been rigorously tested.',
    icon: 'CheckCircle',
  },
  {
    title: 'Wide Selection',
    description: 'We offer a wide selection of cars from some of the most popular Japanese brands.',
    icon: 'Car',
  },
  {
    title: 'Dedicated Team',
    description:
      'We have a team of dedicated and experienced professionals who always help our customers. Moreover, we offer after-sales service for our customers.',
    icon: 'Users',
  },
  {
    title: 'Best Prices',
    description: 'We offer the best prices in Bangladesh for Japanese Reconditioned Cars.',
    icon: 'Target',
  },
];

const NAV_ITEMS = [
  ['Home', 'হোম', '/'],
  ['Inventory', 'ইনভেন্টরি', '/cars'],
  ['About', 'সম্পর্কে', '/about'],
  ['Career', 'ক্যারিয়ার', '/career'],
  ['Contact', 'যোগাযোগ', '/contact'],
];

const BANNER_MEDIA = [
  ['banner-1.png', 'Premium white SUV in showroom'],
  ['banner-2.png', 'Luxury black sedan'],
  ['banner-3.png', 'Red sports car'],
];

const CONTACT_FORM_ELEMENTS = [
  {
    updated_on: 'contact-first-name',
    type: 'input',
    element_type: 'input',
    input_type: 'text',
    label: 'First Name',
    placeholder: 'First name',
    required: true,
    width: 'half',
    name: 'firstName',
  },
  {
    updated_on: 'contact-last-name',
    type: 'input',
    element_type: 'input',
    input_type: 'text',
    label: 'Last Name',
    placeholder: 'Last name',
    required: true,
    width: 'half',
    name: 'lastName',
  },
  {
    updated_on: 'contact-phone',
    type: 'input',
    element_type: 'input',
    input_type: 'tel',
    label: 'Phone Number',
    placeholder: 'Your phone number',
    required: true,
    width: 'half',
    name: 'phone',
  },
  {
    updated_on: 'contact-email',
    type: 'input',
    element_type: 'input',
    input_type: 'email',
    label: 'Email Address',
    placeholder: 'you@example.com',
    required: true,
    width: 'half',
    name: 'email',
  },
  {
    updated_on: 'contact-message',
    type: 'textarea',
    element_type: 'textarea',
    label: 'Message',
    placeholder: 'Tell us about your inquiry...',
    required: true,
    width: 'full',
    name: 'message',
  },
  {
    updated_on: 'contact-submit',
    type: 'button',
    element_type: 'button',
    input_type: 'submit',
    label: 'CONTACT US',
    placeholder: 'CONTACT US',
    required: false,
    width: 'full',
    name: 'submit',
  },
];

const BUSINESS_HOURS = [
  { day: 'Friday', hours: 'Closed' },
  { day: 'Saturday', hours: '9 AM–7 PM' },
  { day: 'Sunday', hours: '9 AM–7 PM' },
  { day: 'Monday', hours: '9 AM–7 PM' },
  { day: 'Tuesday', hours: '9 AM–7 PM' },
  { day: 'Wednesday', hours: '9 AM–7 PM' },
  { day: 'Thursday', hours: '9 AM–7 PM' },
];

async function upsertByKeys(trx: any, table: string, match: Record<string, unknown>, payload: Record<string, unknown>) {
  const existing = await trx(table).where(match).first();
  const now = new Date();

  if (existing) {
    await trx(table).where({ id: existing.id }).update({ ...payload, updated_at: now });
    return { ...existing, ...payload };
  }

  const [row] = await trx(table)
    .insert({ ...match, ...payload, created_at: now, updated_at: now })
    .returning('*');
  return row;
}

function parseMenuItemIds(menu: any) {
  if (!menu?.menu_item_ids) return [];
  if (typeof menu.menu_item_ids === 'string') {
    return JSON.parse(menu.menu_item_ids);
  }
  return menu.menu_item_ids;
}

async function loadMenuHeadless(trx: any, menu: any) {
  const menuItemIds = parseMenuItemIds(menu);
  const items = menuItemIds.length
    ? await trx('menu_items').whereIn('id', menuItemIds)
    : [];
  const itemMap = Object.fromEntries(items.map((item) => [item.id, item]));

  return {
    menu_item_ids: menuItemIds,
    menu_items: menuItemIds
      .map((id) => itemMap[id])
      .filter(Boolean)
      .map((item) => ({
        id: item.id,
        title: item.title,
        title_bn: item.title_bn,
        link: item.link,
        parent_id: item.parent_id,
      })),
  };
}

function buildSiteSettings(followUsMenuItemIds: number[], headerMenuItemIds: number[]) {
  return {
    name: 'Dream Agent Car Vision',
    logo: '/logo.svg',
    logoOnDark: '/logo-on-dark.svg',
    tagline: 'Dhaka',
    description:
      'Japanese New and Reconditioned car importer. Call/whatsapp +8801714211956 (10am-8pm) ☎️ +88 (02) 583 16539.',
    appUrl: 'https://dreamagentcarvision.com',
    contact: {
      email: 'car_vision71@yahoo.com',
      phone: '01714211956',
      address: 'Dream Agent Car Vision, 37 Purana Paltan Line, Dhaka 1205, Bangladesh.',
      googleMaps: {
        placeName: 'Dream Agent Car Vision',
        url: 'https://www.google.com/maps/place/Dream+Agent+Car+Vision/@23.7370766,90.4118018,18z/data=!4m6!3m5!1s0x3755b8f56eb9cebd:0x1a22fdaa024ac5e4!8m2!3d23.7370766!4d90.4118018!16s%2Fg%2F11f_zl_5gc',
        embedUrl:
          'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5845.549!2d90.4118018!3d23.7370766!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8f56eb9cebd%3A0x1a22fdaa024ac5e4!2sDream%20Agent%20Car%20Vision!5e0!3m2!1sen!2sbd!4v1730000000000!5m2!1sen!2sbd',
      },
      businessHours: BUSINESS_HOURS,
    },
    career: {
      email: 'car_vision71@yahoo.com',
    },
    offices: {
      corporate: {
        name: 'Office Address',
        address: '37, Purana Paltan Line, Dhaka 1205, Bangladesh.',
        phone: '01714211956',
        email: 'car_vision71@yahoo.com',
      },
    },
    links: {
      login: '/login',
      catalog: '/cars',
    },
    social: {
      facebook: 'https://www.facebook.com/DreamAgentCarVision/',
      youtube: 'https://youtube.com',
      linkedin: 'https://linkedin.com',
    },
    follow_us: {
      label: 'Follow Us',
      menu_item_ids: followUsMenuItemIds,
    },
    messenger: 'https://m.me/DreamAgentCarVision',
  };
}

function buildMainSiteFooterPage(logo: any, quickMenuHeadless: any, helpMenuHeadless: any, platformMenuHeadless: any, quickMenu: any, helpMenu: any, platformMenu: any) {
  const body = [
    {
      _id: 'section-footer-brand',
      title: 'Brand & Address',
      data: [
        {
          _id: 'footer-logo',
          type: 'media',
          id: logo.id,
          value: '',
          settings: [],
          _headless: { ...logo },
        },
        {
          _id: 'footer-office-title',
          type: 'title',
          value: 'Office Address',
          settings: [],
          _headless: {
            text: 'Office Address',
            fontSize: 'medium',
            primaryColor: '#ffffff',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'footer-office-address',
          type: 'description',
          value: '37, Purana Paltan Line, Dhaka 1205, Bangladesh.',
          settings: [],
          _headless: {
            text: '37, Purana Paltan Line, Dhaka 1205, Bangladesh.',
            fontSize: 'small',
            primaryColor: '#94a3b8',
            textAlign: 'left',
            fontWeight: 'normal',
          },
        },
      ],
    },
    {
      _id: 'section-footer-quick',
      title: 'Quick Links',
      data: [
        {
          _id: 'footer-quick-title',
          type: 'title',
          value: 'Quick Links',
          settings: [],
          _headless: {
            text: 'Quick Links',
            fontSize: 'medium',
            primaryColor: '#ffffff',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'footer-quick-menu',
          type: 'menu',
          menu_item_ids: quickMenuHeadless.menu_item_ids,
          value: '',
          menuMode: 'vertical',
          menuTheme: 'dark',
          settings: [],
          _headless: quickMenuHeadless,
        },
      ],
    },
    {
      _id: 'section-footer-help',
      title: 'Can We Help?',
      data: [
        {
          _id: 'footer-help-title',
          type: 'title',
          value: 'Can We Help?',
          settings: [],
          _headless: {
            text: 'Can We Help?',
            fontSize: 'medium',
            primaryColor: '#ffffff',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'footer-help-menu',
          type: 'menu',
          menu_item_ids: helpMenuHeadless.menu_item_ids,
          value: '',
          menuMode: 'vertical',
          menuTheme: 'dark',
          settings: [],
          _headless: helpMenuHeadless,
        },
      ],
    },
    {
      _id: 'section-footer-platform',
      title: 'Platform',
      data: [
        {
          _id: 'footer-platform-title',
          type: 'title',
          value: 'Platform',
          settings: [],
          _headless: {
            text: 'Platform',
            fontSize: 'medium',
            primaryColor: '#ffffff',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'footer-platform-menu',
          type: 'menu',
          menu_item_ids: platformMenuHeadless.menu_item_ids,
          value: '',
          menuMode: 'vertical',
          menuTheme: 'dark',
          settings: [],
          _headless: platformMenuHeadless,
        },
      ],
    },
    {
      _id: 'section-footer-contact',
      title: 'Get In Touch',
      data: [
        {
          _id: 'footer-contact-title',
          type: 'title',
          value: 'Get In Touch',
          settings: [],
          _headless: {
            text: 'Get In Touch',
            fontSize: 'medium',
            primaryColor: '#ffffff',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'footer-contact-phone',
          type: 'title',
          value: '01714211956',
          settings: [],
          _headless: {
            text: '01714211956',
            fontSize: 'large',
            primaryColor: '#ffffff',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'footer-contact-copy',
          type: 'description',
          value: 'Dream Agent Car Vision — car sales In Dhaka. Get in touch.',
          settings: [],
          _headless: {
            text: 'Dream Agent Car Vision — car sales In Dhaka. Get in touch.',
            fontSize: 'small',
            primaryColor: '#94a3b8',
            textAlign: 'left',
            fontWeight: 'normal',
          },
        },
        {
          _id: 'footer-contact-email',
          type: 'description',
          value: 'car_vision71@yahoo.com',
          settings: [],
          _headless: {
            text: 'car_vision71@yahoo.com',
            fontSize: 'small',
            primaryColor: '#94a3b8',
            textAlign: 'left',
            fontWeight: 'normal',
          },
        },
      ],
    },
    {
      _id: 'section-footer-bottom',
      title: 'Bottom Bar',
      data: [
        {
          _id: 'footer-copyright',
          type: 'description',
          value: '© 2026 DREAM AGENT CAR VISION.',
          settings: [],
          _headless: {
            text: '© 2026 DREAM AGENT CAR VISION.',
            fontSize: 'small',
            primaryColor: '#64748b',
            textAlign: 'left',
            fontWeight: 'normal',
          },
        },
        {
          _id: 'footer-trust-badge',
          type: 'description',
          value: 'Trusted Dealership Platform',
          settings: [],
          _headless: {
            text: 'Trusted Dealership Platform',
            fontSize: 'small',
            primaryColor: '#64748b',
            textAlign: 'right',
            fontWeight: 'normal',
          },
        },
      ],
    },
  ];

  return {
    type: 'Footer',
    page_name_en: 'Main Site Footer',
    page_name_bn: 'প্রধান সাইট ফুটার',
    head: {
      title: 'Main Site Footer',
      description: 'Dream Agent Car Vision website footer',
    },
    body,
    body_raw: {
      footer: [],
      navbar: [],
      slider: [],
      card: [],
      media: [logo.id],
      menu: [],
    },
    additional: [
      {
        pageType: 'Footer',
        metaTitle: 'Main Site Footer',
        metaDescription: 'Dream Agent Car Vision website footer',
        keywords: [],
        metaImage: '',
        metaImageAlt: '',
      },
    ],
    status: true,
  };
}

function buildHomePage(ctx: any) {
  const {
    heroSlider,
    contactCta,
    followUsMenuHeadless,
    followUsMenu,
    headerMenu,
    bannerMedia,
    siteSettings,
  } = ctx;

  const body = [
    {
      _id: 'section-home-hero',
      title: 'Hero',
      data: [
        {
          _id: 'home-hero-slider',
          type: 'slider',
          id: heroSlider.id,
          value: '',
          settings: [],
          _headless: {
            id: heroSlider.id,
            title_en: heroSlider.title_en,
            description_en: heroSlider.description_en,
            type: heroSlider.type,
            media_ids: parseMenuItemIds({ menu_item_ids: heroSlider.media_ids }),
            additional:
              typeof heroSlider.additional === 'string'
                ? JSON.parse(heroSlider.additional)
                : heroSlider.additional,
            status: heroSlider.status,
          },
        },
        {
          _id: 'home-hero-eyebrow',
          type: 'title',
          value: 'Dream Agent Car Vision',
          settings: [],
          _headless: {
            text: 'Dream Agent Car Vision',
            fontSize: 'small',
            primaryColor: '#ffffff',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'home-hero-headline',
          type: 'title',
          value: 'Find Your Next Car,\nthe Smart Way',
          settings: [],
          _headless: {
            text: 'Find Your Next Car,\nthe Smart Way',
            fontSize: 'large',
            primaryColor: '#ffffff',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'home-hero-subheadline',
          type: 'description',
          value:
            'Browse quality vehicles with transparent specs, photos, and pricing — all in one place.',
          settings: [],
          _headless: {
            text: 'Browse quality vehicles with transparent specs, photos, and pricing — all in one place.',
            fontSize: 'medium',
            primaryColor: '#cbd5e1',
            textAlign: 'left',
            fontWeight: 'normal',
          },
        },
        {
          _id: 'home-hero-ctas',
          type: 'titledescription',
          value: '',
          settings: [],
          _headless: {
            title: 'Browse Inventory',
            description: 'Contact Us',
            fontSize: 'medium',
            primaryColor: '#db2d2e',
            textAlign: 'left',
            fontWeight: 'bold',
            primary_cta: { label: 'Browse Inventory', href: '/cars' },
            secondary_cta: { label: 'Contact Us', href: '/contact' },
          },
        },
      ],
    },
    {
      _id: 'section-home-featured',
      title: 'Featured Inventory (labels only — cars from API)',
      data: [
        {
          _id: 'home-featured-title',
          type: 'title',
          value: 'Featured Inventory',
          settings: [],
          _headless: {
            text: 'Featured Inventory',
            fontSize: 'large',
            primaryColor: '#0f172a',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'home-featured-subtitle',
          type: 'description',
          value: 'Browse our latest available vehicles',
          settings: [],
          _headless: {
            text: 'Browse our latest available vehicles',
            fontSize: 'medium',
            primaryColor: '#64748b',
            textAlign: 'left',
            fontWeight: 'normal',
          },
        },
        {
          _id: 'home-featured-cta',
          type: 'titledescription',
          value: '',
          settings: [],
          _headless: {
            title: 'View all',
            description: 'Vehicle cards are loaded from the cars API — not managed in this CMS.',
            fontSize: 'medium',
            primaryColor: '#db2d2e',
            textAlign: 'left',
            fontWeight: 'bold',
            linkType: 'independent',
            link: '/cars',
          },
        },
      ],
    },
    {
      _id: 'section-home-contact-cta',
      title: 'Contact CTA',
      data: [
        {
          _id: 'home-contact-cta-card',
          type: 'card',
          id: contactCta.id,
          value: '',
          settings: [],
          _headless: {
            id: contactCta.id,
            title_en: contactCta.title_en,
            description_en: contactCta.description_en,
            link_url: contactCta.link_url,
            additional:
              typeof contactCta.additional === 'string'
                ? JSON.parse(contactCta.additional)
                : contactCta.additional,
          },
        },
      ],
    },
    {
      _id: 'section-home-follow-us',
      title: 'Follow Us Sidebar',
      data: [
        {
          _id: 'home-follow-us-title',
          type: 'title',
          value: 'Follow Us',
          settings: [],
          _headless: {
            text: 'Follow Us',
            fontSize: 'small',
            primaryColor: '#000000',
            textAlign: 'center',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'home-follow-us-menu',
          type: 'menu',
          menu_item_ids: followUsMenuHeadless.menu_item_ids,
          value: '',
          menuMode: 'vertical',
          menuTheme: 'light',
          settings: [],
          _headless: followUsMenuHeadless,
        },
      ],
    },
    {
      _id: 'section-home-find-us',
      title: 'Find Us / Our Location',
      data: [
        {
          _id: 'home-find-us-eyebrow',
          type: 'title',
          value: 'Find Us',
          settings: [],
          _headless: {
            text: 'Find Us',
            fontSize: 'small',
            primaryColor: '#db2d2e',
            textAlign: 'center',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'home-find-us-heading',
          type: 'title',
          value: 'Our Location',
          settings: [],
          _headless: {
            text: 'Our Location',
            fontSize: 'large',
            primaryColor: '#0f172a',
            textAlign: 'center',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'home-find-us-map',
          type: 'google-map',
          value: '',
          settings: [],
          _headless: {
            mapUrl: siteSettings.contact.googleMaps.url,
            embedUrl: siteSettings.contact.googleMaps.embedUrl,
            zoom: 18,
            coordinates: { lat: 23.7370766, lng: 90.4118018 },
            altTitle: siteSettings.contact.googleMaps.placeName,
            markers: [],
          },
        },
      ],
    },
  ];

  return {
    type: 'Page',
    page_name_en: 'Home',
    page_name_bn: 'হোম',
    head: {
      title: 'Dream Agent Car Vision | Dhaka',
      meta_description: siteSettings.description,
    },
    body,
    body_raw: {
      navbar: [],
      slider: [heroSlider.id],
      card: [contactCta.id],
      footer: [],
      media: bannerMedia.map((m) => m.id),
      menu: [],
    },
    additional: {
      follow_us: {
        label: 'Follow Us',
        menu_item_ids: followUsMenu.menu_item_ids,
      },
      find_us: {
        eyebrow: 'Find Us',
        heading: 'Our Location',
        placeName: siteSettings.contact.googleMaps.placeName,
        mapUrl: siteSettings.contact.googleMaps.url,
        embedUrl: siteSettings.contact.googleMaps.embedUrl,
        zoom: 18,
        coordinates: { lat: 23.7370766, lng: 90.4118018 },
      },
      hero: {
        eyebrow: 'Dream Agent Car Vision',
        headline: 'Find Your Next Car,\nthe Smart Way',
        subheadline:
          'Browse quality vehicles with transparent specs, photos, and pricing — all in one place.',
        primary_cta: { label: 'Browse Inventory', href: '/cars' },
        secondary_cta: { label: 'Contact Us', href: '/contact' },
        slider_id: heroSlider.id,
      },
      featured: {
        title: 'Featured Inventory',
        subtitle: 'Browse our latest available vehicles',
        cta_label: 'View all',
        cta_href: '/cars',
      },
      cta: {
        phone_prefix: 'Call @',
        description:
          'Our team is ready to help with inventory inquiries, test drives, financing options, and dealership support. Reach out anytime during business hours.',
        button_label: 'Contact Us',
        button_href: '/contact',
        image:
          'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
      },
      note: 'Featured Inventory vehicle cards are loaded from the external cars API, not from this CMS. Only section labels/CTAs are editable here.',
    },
    status: true,
  };
}

function buildAboutPage(whyBuyCardModels: any, whyBuyCardIds: number[]) {
  const whyBuyCardBodyItems = whyBuyCardModels.map((card, index) => ({
    _id: `about-why-card-${card.id}`,
    type: 'card',
    id: card.id,
    value: '',
    settings: [],
    _headless: {
      id: card.id,
      title_en: card.title_en,
      description_en: card.description_en,
      link_url: card.link_url,
      additional:
        typeof card.additional === 'string' ? JSON.parse(card.additional) : card.additional,
      order: index + 1,
    },
  }));

  const body = [
    {
      _id: 'section-about-hero',
      title: 'Hero',
      data: [
        {
          _id: 'about-hero-title',
          type: 'title',
          value: 'About Us',
          settings: [],
          _headless: {
            text: 'About Us',
            fontSize: 'large',
            primaryColor: '#ffffff',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'about-hero-description',
          type: 'description',
          value: 'Your trusted source for high-quality Japanese reconditioned vehicles in Bangladesh.',
          settings: [],
          _headless: {
            text: 'Your trusted source for high-quality Japanese reconditioned vehicles in Bangladesh.',
            fontSize: 'medium',
            primaryColor: '#cbd5e1',
            textAlign: 'left',
            fontWeight: 'normal',
          },
        },
      ],
    },
    {
      _id: 'section-about-why-buy',
      title: 'Why Buy a Car from Dream Agent Car Vision?',
      data: [
        {
          _id: 'about-why-title',
          type: 'title',
          value: 'Why Buy a Car from Dream Agent Car Vision?',
          settings: [],
          _headless: {
            text: 'Why Buy a Car from Dream Agent Car Vision?',
            fontSize: 'large',
            primaryColor: '#0f172a',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'about-why-intro',
          type: 'description',
          value: 'There are several reasons why someone might want to buy a car from Dream Agent Car Vision.',
          settings: [],
          _headless: {
            text: 'There are several reasons why someone might want to buy a car from Dream Agent Car Vision.',
            fontSize: 'medium',
            primaryColor: '#64748b',
            textAlign: 'left',
            fontWeight: 'normal',
          },
        },
        ...whyBuyCardBodyItems,
      ],
    },
    {
      _id: 'section-about-brands',
      title: 'Deals with all Japanese & European Brands',
      data: [
        {
          _id: 'about-brands-title',
          type: 'title',
          value: 'Deals with all Japanese & European Brands',
          settings: [],
          _headless: {
            text: 'Deals with all Japanese & European Brands',
            fontSize: 'large',
            primaryColor: '#0f172a',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'about-brands-p1',
          type: 'description',
          value:
            'Dream Agent Car Vision specializes in importing vehicles from all major Japanese brands. Our extensive inventory includes popular brands such as Toyota, Honda, Nissan, Suzuki, Mazda, and Subaru, among others. We focus on providing high-quality reconditioned cars that meet the diverse needs of our customers. Each vehicle comes with authentic auction sheets, ensuring transparency and trust. By offering a wide range of models, Dream Agent Car Vision ensures that customers can find the perfect vehicle that suits their preferences and lifestyle.',
          settings: [],
          _headless: {
            text: 'Dream Agent Car Vision specializes in importing vehicles from all major Japanese brands. Our extensive inventory includes popular brands such as Toyota, Honda, Nissan, Suzuki, Mazda, and Subaru, among others. We focus on providing high-quality reconditioned cars that meet the diverse needs of our customers. Each vehicle comes with authentic auction sheets, ensuring transparency and trust. By offering a wide range of models, Dream Agent Car Vision ensures that customers can find the perfect vehicle that suits their preferences and lifestyle.',
            fontSize: 'medium',
            primaryColor: '#64748b',
            textAlign: 'left',
            fontWeight: 'normal',
          },
        },
        {
          _id: 'about-brands-p2',
          type: 'description',
          value:
            'Dream Agent Car Vision also offers a pre-order service for European Brand New cars, allowing customers to secure their preferred models before they arrive in Bangladesh. This service caters to enthusiasts and buyers looking for specific European brands such as BMW, Mercedes-Benz, Audi, Volkswagen, and Volvo.',
          settings: [],
          _headless: {
            text: 'Dream Agent Car Vision also offers a pre-order service for European Brand New cars, allowing customers to secure their preferred models before they arrive in Bangladesh. This service caters to enthusiasts and buyers looking for specific European brands such as BMW, Mercedes-Benz, Audi, Volkswagen, and Volvo.',
            fontSize: 'medium',
            primaryColor: '#64748b',
            textAlign: 'left',
            fontWeight: 'normal',
          },
        },
        {
          _id: 'about-brands-list',
          type: 'titledescription',
          value: '',
          settings: [],
          _headless: {
            title: 'Brands we deal with',
            description:
              'Toyota, Honda, Nissan, Suzuki, Mazda, Subaru, Mitsubishi, BMW, Mercedes-Benz, Audi, Volkswagen, Volvo',
            fontSize: 'medium',
            primaryColor: '#0f172a',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
      ],
    },
    {
      _id: 'section-about-cta',
      title: 'Join CTA',
      data: [
        {
          _id: 'about-cta-block',
          type: 'titledescription',
          value: '',
          settings: [],
          _headless: {
            title: 'So why late? Be a family member of Dream Agent Car Vision',
            description:
              'Join thousands of satisfied customers who trust us for their vehicle needs. Experience transparency, quality, and exceptional service.',
            fontSize: 'large',
            primaryColor: '#ffffff',
            textAlign: 'center',
            fontWeight: 'bold',
            linkType: 'independent',
            link: '/cars',
            link_label: 'Browse Our Cars',
          },
        },
      ],
    },
  ];

  return {
    type: 'Page',
    page_name_en: 'About',
    page_name_bn: 'সম্পর্কে',
    head: {
      title: 'About - Dream Agent Car Vision',
      meta_description:
        'Learn about Dream Agent Car Vision — your trusted source for high-quality Japanese reconditioned vehicles in Bangladesh. Founded by Mehedi Hasan in 2026.',
    },
    body,
    body_raw: {
      card: whyBuyCardIds,
      slider: [],
      navbar: [],
      footer: [],
      media: [],
      menu: [],
    },
    additional: {
      hero: {
        title: 'About Us',
        subtitle: 'Your trusted source for high-quality Japanese reconditioned vehicles in Bangladesh.',
        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920&q=80',
      },
      whyBuy: {
        title: 'Why Buy a Car from Dream Agent Car Vision?',
        intro: 'There are several reasons why someone might want to buy a car from Dream Agent Car Vision.',
        items: WHY_BUY_CARDS,
      },
      brands: {
        title: 'Deals with all Japanese & European Brands',
        paragraphs: [
          'Dream Agent Car Vision specializes in importing vehicles from all major Japanese brands. Our extensive inventory includes popular brands such as Toyota, Honda, Nissan, Suzuki, Mazda, and Subaru, among others. We focus on providing high-quality reconditioned cars that meet the diverse needs of our customers. Each vehicle comes with authentic auction sheets, ensuring transparency and trust. By offering a wide range of models, Dream Agent Car Vision ensures that customers can find the perfect vehicle that suits their preferences and lifestyle.',
          'Dream Agent Car Vision also offers a pre-order service for European Brand New cars, allowing customers to secure their preferred models before they arrive in Bangladesh. This service caters to enthusiasts and buyers looking for specific European brands such as BMW, Mercedes-Benz, Audi, Volkswagen, and Volvo.',
        ],
        list: [
          'Toyota',
          'Honda',
          'Nissan',
          'Suzuki',
          'Mazda',
          'Subaru',
          'Mitsubishi',
          'BMW',
          'Mercedes-Benz',
          'Audi',
          'Volkswagen',
          'Volvo',
        ],
        list_label: 'Brands we deal with',
      },
      cta: {
        title: 'So why late? Be a family member of Dream Agent Car Vision',
        description:
          'Join thousands of satisfied customers who trust us for their vehicle needs. Experience transparency, quality, and exceptional service.',
        button_label: 'Browse Our Cars',
        button_href: '/cars',
      },
    },
    status: true,
  };
}

function buildContactPage(contactCta: any, contactFormBuilder: any) {
  const formAttributes =
    typeof contactFormBuilder.attributes === 'string'
      ? JSON.parse(contactFormBuilder.attributes)
      : contactFormBuilder.attributes;
  const formElements =
    typeof contactFormBuilder.elements === 'string'
      ? JSON.parse(contactFormBuilder.elements)
      : contactFormBuilder.elements;

  const body = [
    {
      _id: 'section-contact-hero',
      title: 'Hero',
      data: [
        {
          _id: 'contact-hero-title',
          type: 'title',
          value: 'Contact Us',
          settings: [],
          _headless: {
            text: 'Contact Us',
            fontSize: 'large',
            primaryColor: '#ffffff',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'contact-hero-description',
          type: 'description',
          value:
            'Reach Dream Agent Car Vision for inventory inquiries, test drives, and dealership support.',
          settings: [],
          _headless: {
            text: 'Reach Dream Agent Car Vision for inventory inquiries, test drives, and dealership support.',
            fontSize: 'medium',
            primaryColor: '#cbd5e1',
            textAlign: 'left',
            fontWeight: 'normal',
          },
        },
      ],
    },
    {
      _id: 'section-contact-help',
      title: 'What can we help you with?',
      data: [
        {
          _id: 'contact-help-title',
          type: 'title',
          value: 'What can we help you with?',
          settings: [],
          _headless: {
            text: 'What can we help you with?',
            fontSize: 'large',
            primaryColor: '#0f172a',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'contact-help-copy',
          type: 'description',
          value: 'Send us a message and our team will get back to you during business hours.',
          settings: [],
          _headless: {
            text: 'Send us a message and our team will get back to you during business hours.',
            fontSize: 'medium',
            primaryColor: '#64748b',
            textAlign: 'left',
            fontWeight: 'normal',
          },
        },
        {
          _id: 'contact-help-form',
          type: 'form',
          value: '',
          settings: [],
          _headless: true,
          data: {
            formId: contactFormBuilder.id,
            title: contactFormBuilder.title,
            description: contactFormBuilder.description,
            elements: formElements,
            attributes: formAttributes,
          },
        },
      ],
    },
    {
      _id: 'section-contact-office',
      title: 'Office Locations',
      data: [
        {
          _id: 'contact-office-title',
          type: 'title',
          value: 'Office Locations',
          settings: [],
          _headless: {
            text: 'Office Locations',
            fontSize: 'large',
            primaryColor: '#0f172a',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'contact-office-name',
          type: 'title',
          value: 'Office Address',
          settings: [],
          _headless: {
            text: 'Office Address',
            fontSize: 'medium',
            primaryColor: '#0f172a',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'contact-office-details',
          type: 'description',
          value: '37, Purana Paltan Line, Dhaka 1205, Bangladesh.\n01714211956\ncar_vision71@yahoo.com',
          settings: [],
          _headless: {
            text: '37, Purana Paltan Line, Dhaka 1205, Bangladesh.\n01714211956\ncar_vision71@yahoo.com',
            fontSize: 'medium',
            primaryColor: '#64748b',
            textAlign: 'left',
            fontWeight: 'normal',
          },
        },
      ],
    },
    {
      _id: 'section-contact-hours',
      title: 'Business Hours',
      data: [
        {
          _id: 'contact-hours-title',
          type: 'title',
          value: 'Business Hours',
          settings: [],
          _headless: {
            text: 'Business Hours',
            fontSize: 'large',
            primaryColor: '#0f172a',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'contact-hours-list',
          type: 'description',
          value:
            'Friday — Closed\nSaturday — 9 AM–7 PM\nSunday — 9 AM–7 PM\nMonday — 9 AM–7 PM\nTuesday — 9 AM–7 PM\nWednesday — 9 AM–7 PM\nThursday — 9 AM–7 PM',
          settings: [],
          _headless: {
            text: 'Friday — Closed\nSaturday — 9 AM–7 PM\nSunday — 9 AM–7 PM\nMonday — 9 AM–7 PM\nTuesday — 9 AM–7 PM\nWednesday — 9 AM–7 PM\nThursday — 9 AM–7 PM',
            fontSize: 'medium',
            primaryColor: '#64748b',
            textAlign: 'left',
            fontWeight: 'normal',
          },
        },
      ],
    },
    {
      _id: 'section-contact-cta',
      title: 'Contact CTA',
      data: [
        {
          _id: 'contact-cta-card',
          type: 'card',
          id: contactCta.id,
          value: '',
          settings: [],
          _headless: {
            id: contactCta.id,
            title_en: contactCta.title_en,
            description_en: contactCta.description_en,
            link_url: contactCta.link_url,
            additional:
              typeof contactCta.additional === 'string'
                ? JSON.parse(contactCta.additional)
                : contactCta.additional,
          },
        },
      ],
    },
  ];

  return {
    type: 'Page',
    page_name_en: 'Contact',
    page_name_bn: 'যোগাযোগ',
    head: {
      title: 'Contact',
      meta_description:
        'Get in touch with Dream Agent Car Vision — office address, business hours, and contact form.',
    },
    body,
    body_raw: {
      card: [contactCta.id],
      slider: [],
      navbar: [],
      footer: [],
      media: [],
      menu: [],
    },
    additional: {
      hero: {
        title: 'Contact Us',
        subtitle:
          'Reach Dream Agent Car Vision for inventory inquiries, test drives, and dealership support.',
        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920&q=80',
      },
      help_title: 'What can we help you with?',
      help_description: 'Send us a message and our team will get back to you during business hours.',
      form_builder_id: contactFormBuilder.id,
      office_title: 'Office Locations',
      office: {
        name: 'Office Address',
        address: '37, Purana Paltan Line, Dhaka 1205, Bangladesh.',
        phone: '01714211956',
        email: 'car_vision71@yahoo.com',
      },
      hours_title: 'Business Hours',
      businessHours: BUSINESS_HOURS,
      cta: {
        phone_prefix: 'Call @',
        description:
          'Our team is ready to help with inventory inquiries, test drives, financing options, and dealership support. Reach out anytime during business hours.',
        button_label: 'Contact Us',
        button_href: '/contact',
        image:
          'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
      },
    },
    status: true,
  };
}

function buildCareerPage() {
  const body = [
    {
      _id: 'section-career-intro',
      title: 'Career Intro',
      data: [
        {
          _id: 'career-title',
          type: 'title',
          value: 'We hire brilliant minds and we help them thrive.',
          settings: [],
          _headless: {
            text: 'We hire brilliant minds and we help them thrive.',
            fontSize: 'large',
            primaryColor: '#0f172a',
            textAlign: 'left',
            fontWeight: 'bold',
          },
        },
        {
          _id: 'career-description',
          type: 'description',
          value:
            'Since its inception, we have been maintaining our legacy without compromising our fundamental values. We always stand up for the ambitious ones who dream of accomplishing positive changes. We enable you to bring your creative ideas into play. We work together to achieve greatness.',
          settings: [],
          _headless: {
            text: 'Since its inception, we have been maintaining our legacy without compromising our fundamental values. We always stand up for the ambitious ones who dream of accomplishing positive changes. We enable you to bring your creative ideas into play. We work together to achieve greatness.',
            fontSize: 'medium',
            primaryColor: '#64748b',
            textAlign: 'left',
            fontWeight: 'normal',
          },
        },
      ],
    },
    {
      _id: 'section-career-apply',
      title: 'Apply',
      data: [
        {
          _id: 'career-email',
          type: 'description',
          value: 'E-mail: car_vision71@yahoo.com',
          settings: [],
          _headless: {
            text: 'E-mail: car_vision71@yahoo.com',
            fontSize: 'medium',
            primaryColor: '#0f172a',
            textAlign: 'left',
            fontWeight: 'normal',
          },
        },
        {
          _id: 'career-apply-cta',
          type: 'titledescription',
          value: '',
          settings: [],
          _headless: {
            title: 'Apply for Executive',
            description: 'Executive Application — Dream Agent Car Vision',
            fontSize: 'medium',
            primaryColor: '#db2d2e',
            textAlign: 'left',
            fontWeight: 'bold',
            linkType: 'independent',
            link: 'mailto:car_vision71@yahoo.com?subject=Executive%20Application%20%E2%80%94%20Dream%20Agent%20Car%20Vision',
          },
        },
      ],
    },
    {
      _id: 'section-career-gallery',
      title: 'Career Gallery',
      data: [
        {
          _id: 'career-image-team',
          type: 'titledescription',
          value: '',
          settings: [],
          _headless: {
            title: 'Team',
            description: 'Collaborative team culture at Dream Agent Car Vision.',
            fontSize: 'medium',
            primaryColor: '#0f172a',
            textAlign: 'left',
            fontWeight: 'bold',
            image:
              'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
          },
        },
        {
          _id: 'career-image-desk',
          type: 'titledescription',
          value: '',
          settings: [],
          _headless: {
            title: 'Workspace',
            description: 'A professional workplace for ambitious people.',
            fontSize: 'medium',
            primaryColor: '#0f172a',
            textAlign: 'left',
            fontWeight: 'bold',
            image:
              'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
          },
        },
      ],
    },
  ];

  return {
    type: 'Page',
    page_name_en: 'Career',
    page_name_bn: 'ক্যারিয়ার',
    head: {
      title: 'Career',
      meta_description:
        'Join the Dream Agent Car Vision team. Explore opportunities in automotive sales and dealership management.',
    },
    body,
    body_raw: {
      card: [],
      slider: [],
      navbar: [],
      footer: [],
      media: [],
      menu: [],
    },
    additional: {
      hero: {
        title: 'Career',
        subtitle: 'Join Dream Agent Car Vision and grow with a trusted automotive team in Dhaka.',
      },
      title: 'We hire brilliant minds and we help them thrive.',
      description:
        'Since its inception, we have been maintaining our legacy without compromising our fundamental values. We always stand up for the ambitious ones who dream of accomplishing positive changes. We enable you to bring your creative ideas into play. We work together to achieve greatness.',
      email: 'car_vision71@yahoo.com',
      apply_label: 'Apply for Executive',
      apply_subject: 'Executive Application — Dream Agent Car Vision',
      accent_color: 'primary',
      images: {
        team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        desk: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      },
    },
    status: true,
  };
}

async function upsertPage(trx: any, organizationId: number, slug: string, pageData: any) {
  const bodyRaw =
    pageData.body_raw ??
    sortRecursive(extractComponentsFromArray(pageData.body || []));

  return upsertByKeys(
    trx,
    'pages',
    { organization_id: organizationId, slug },
    {
      type: pageData.type,
      page_name_en: pageData.page_name_en,
      page_name_bn: pageData.page_name_bn,
      head: JSON.stringify(pageData.head ?? null),
      body: JSON.stringify(pageData.body ?? []),
      body_raw: JSON.stringify(bodyRaw),
      additional: JSON.stringify(pageData.additional ?? null),
      status: pageData.status ?? true,
    }
  );
}

/**
 * Seed all Dream Agent Car Vision CMS content inline (no API).
 *
 * @param {import('knex').Knex} knex
 * @param {{ id: number, slug?: string, name?: string }} organization
 */
async function seedCarVisionContent(knex: any, organization: { id: number }) {
  await knex.transaction(async (trx) => {
    const orgId = organization.id;

    const logo = await upsertByKeys(
      trx,
      'media',
      { organization_id: orgId, file_name: 'logo.svg' },
      {
        title: 'Dream Agent Car Vision Logo',
        file_type: 'image/svg+xml',
        file_path: '/logo.svg',
        file_size: 0,
        tags: JSON.stringify(['logo', 'brand']),
      }
    );

    const bannerMedia = [];
    for (const [fileName, title] of BANNER_MEDIA) {
      const media = await upsertByKeys(
        trx,
        'media',
        { organization_id: orgId, file_name: fileName },
        {
          title,
          file_type: 'image/png',
          file_path: `/banners/${fileName}`,
          file_size: 0,
          tags: JSON.stringify(['hero', 'banner']),
        }
      );
      bannerMedia.push(media);
    }

    const menuItemIds = [];
    for (const [title, titleBn, link] of NAV_ITEMS) {
      const item = await upsertByKeys(
        trx,
        'menu_items',
        { organization_id: orgId, title },
        {
          title_bn: titleBn,
          link,
          parent_id: null,
        }
      );
      menuItemIds.push(item.id);
    }

    const headerMenu = { name: 'Header Navigation', menu_item_ids: menuItemIds };

    const inventoryFooterItem = await upsertByKeys(
      trx,
      'menu_items',
      { organization_id: orgId, title: 'Car Inventory' },
      {
        title_bn: 'গাড়ির তালিকা',
        link: '/cars',
        parent_id: null,
      }
    );

    const aboutFooterItem = await upsertByKeys(
      trx,
      'menu_items',
      { organization_id: orgId, title: 'About Us' },
      {
        title_bn: 'আমাদের সম্পর্কে',
        link: '/about',
        parent_id: null,
      }
    );

    const quickIds = [
      menuItemIds[0],
      inventoryFooterItem.id,
      aboutFooterItem.id,
      menuItemIds[3],
      menuItemIds[4],
    ];

    const quickMenu = { name: 'Footer Quick Links', menu_item_ids: quickIds };

    const contactUsItem = await upsertByKeys(
      trx,
      'menu_items',
      { organization_id: orgId, title: 'Contact Us' },
      {
        title_bn: 'যোগাযোগ করুন',
        link: '/contact',
        parent_id: null,
      }
    );

    const helpMenu = { name: 'Footer Help Links', menu_item_ids: [contactUsItem.id, aboutFooterItem.id] };

    const dealerLoginItem = await upsertByKeys(
      trx,
      'menu_items',
      { organization_id: orgId, title: 'Dealer Login' },
      {
        title_bn: 'ডিলার লগইন',
        link: 'https://dreamagentcarvision.com/login',
        parent_id: null,
      }
    );

    const platformMenu = { name: 'Footer Platform Links', menu_item_ids: [dealerLoginItem.id] };

    const facebookSocialItem = await upsertByKeys(
      trx,
      'menu_items',
      { organization_id: orgId, title: 'Facebook' },
      {
        title_bn: 'ফেসবুক',
        link: 'https://www.facebook.com/DreamAgentCarVision/',
        parent_id: null,
      }
    );

    const youtubeSocialItem = await upsertByKeys(
      trx,
      'menu_items',
      { organization_id: orgId, title: 'YouTube' },
      {
        title_bn: 'ইউটিউব',
        link: 'https://youtube.com',
        parent_id: null,
      }
    );

    const linkedinSocialItem = await upsertByKeys(
      trx,
      'menu_items',
      { organization_id: orgId, title: 'LinkedIn' },
      {
        title_bn: 'লিংকডইন',
        link: 'https://linkedin.com',
        parent_id: null,
      }
    );

    const followUsMenu = {
      name: 'Follow Us',
      menu_item_ids: [
        facebookSocialItem.id,
        youtubeSocialItem.id,
        linkedinSocialItem.id,
      ],
    };

    await upsertByKeys(
      trx,
      'navbars',
      { organization_id: orgId, title_en: 'Main Navbar' },
      {
        title_bn: 'প্রধান নেভবার',
        menu_item_ids: JSON.stringify(headerMenu.menu_item_ids),
        logo_id: logo.id,
      }
    );

    await upsertByKeys(
      trx,
      'footers',
      { organization_id: orgId, title_en: 'Main Footer' },
      {
        title_bn: 'প্রধান ফুটার',
        footer_status: 1,
        logo_id: logo.id,
        address1_title_en: 'Office Address',
        address1_title_bn: 'অফিসের ঠিকানা',
        address1_description_en: '37, Purana Paltan Line, Dhaka 1205, Bangladesh.',
        address1_description_bn: '৩৭, পুরানা পল্টন লাইন, ঢাকা ১২০৫, বাংলাদেশ।',
        address2_title_en: 'Get In Touch',
        address2_title_bn: 'যোগাযোগ করুন',
        address2_description_en: 'Phone: 01714211956\nEmail: car_vision71@yahoo.com',
        address2_description_bn: 'ফোন: ০১৭১৪২১১৯৫৬\nইমেইল: car_vision71@yahoo.com',
        address1_status: 1,
        address2_status: 1,
        column2_menu_item_ids: JSON.stringify(quickMenu.menu_item_ids),
        column2_status: 1,
        column3_menu_item_ids: JSON.stringify(helpMenu.menu_item_ids),
        column3_status: 1,
        column3_logos: JSON.stringify([]),
        column4_menu_item_ids: JSON.stringify(platformMenu.menu_item_ids),
        column4_title_en: 'Get In Touch',
        column4_title_bn: 'যোগাযোগ করুন',
        column4_text_en: 'Dream Agent Car Vision — car sales In Dhaka. Get in touch.',
        column4_text_bn: 'ড্রিম এজেন্ট কার ভিশন — ঢাকায় গাড়ি বিক্রয়। যোগাযোগ করুন।',
        column4_description_en: 'Trusted Dealership Platform',
        column4_description_bn: 'বিশ্বস্ত ডিলারশিপ প্ল্যাটফর্ম',
        column4_status: 1,
      }
    );

    const quickMenuHeadless = await loadMenuHeadless(trx, quickMenu);
    const helpMenuHeadless = await loadMenuHeadless(trx, helpMenu);
    const platformMenuHeadless = await loadMenuHeadless(trx, platformMenu);
    const followUsMenuHeadless = await loadMenuHeadless(trx, followUsMenu);

    await upsertPage(
      trx,
      orgId,
      'main-site-footer',
      buildMainSiteFooterPage(
        logo,
        quickMenuHeadless,
        helpMenuHeadless,
        platformMenuHeadless,
        quickMenu,
        helpMenu,
        platformMenu
      )
    );

    const whyBuyCardIds = [];
    const whyBuyCardModels = [];
    for (let index = 0; index < WHY_BUY_CARDS.length; index += 1) {
      const reason = WHY_BUY_CARDS[index];
      const card = await upsertByKeys(
        trx,
        'cards',
        {
          organization_id: orgId,
          page_name: 'about',
          title_en: reason.title,
        },
        {
          title_bn: reason.title,
          description_en: `<p>${reason.description}</p>`,
          description_bn: `<p>${reason.description}</p>`,
          link_url: null,
          additional: JSON.stringify({
            icon: reason.icon,
            order: index + 1,
            section: 'why_buy',
          }),
          status: true,
        }
      );
      whyBuyCardIds.push(card.id);
      whyBuyCardModels.push(card);
    }

    const contactCta = await upsertByKeys(
      trx,
      'cards',
      {
        organization_id: orgId,
        page_name: 'home',
        title_en: 'Contact CTA',
      },
      {
        title_bn: 'যোগাযোগ সিটিএ',
        description_en:
          '<p>Our team is ready to help with inventory inquiries, test drives, financing options, and dealership support. Reach out anytime during business hours.</p>',
        description_bn:
          '<p>ইনভেন্টরি জিজ্ঞাসা, টেস্ট ড্রাইভ, ফাইন্যান্সিং এবং ডিলারশিপ সাপোর্টে আমাদের টিম প্রস্তুত।</p>',
        link_url: '/contact',
        additional: JSON.stringify({
          section: 'contact_cta',
          cta_label: 'Contact Us',
          image:
            'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
          phone_prefix: 'Call @',
        }),
        status: true,
      }
    );

    const heroSlider = await upsertByKeys(
      trx,
      'sliders',
      { organization_id: orgId, title_en: 'Home Hero Slider' },
      {
        type: 'hero',
        title_bn: 'হোম হিরো স্লাইডার',
        description_en: 'Find Your Next Car, the Smart Way',
        description_bn: 'স্মার্ট উপায়ে আপনার পরবর্তী গাড়ি খুঁজুন',
        media_ids: JSON.stringify(bannerMedia.map((m) => m.id)),
        card_ids: JSON.stringify([]),
        additional: JSON.stringify({
          eyebrow: 'Dream Agent Car Vision',
          headline: 'Find Your Next Car,\nthe Smart Way',
          subheadline:
            'Browse quality vehicles with transparent specs, photos, and pricing — all in one place.',
          primary_cta: { label: 'Browse Inventory', href: '/cars' },
          secondary_cta: { label: 'Contact Us', href: '/contact' },
          slides: bannerMedia.map((m) => ({
            id: m.id,
            image: m.file_path,
            alt: m.title,
          })),
        }),
        status: 1,
      }
    );

    const contactFormBuilder = await upsertByKeys(
      trx,
      'form_builder',
      { organization_id: orgId, title: 'Website Contact Form' },
      {
        description: 'Contact Dream Agent Car Vision from the website contact page.',
        attributes: JSON.stringify({
          component_id: 'website_contact_form',
          component_class: 'contact-form',
          method: 'POST',
          enctype: 'application/json',
          layout: 'contact-grid',
          submit_text: 'CONTACT US',
          action_url: '',
        }),
        elements: JSON.stringify(CONTACT_FORM_ELEMENTS),
        additional: JSON.stringify({
          page: 'contact',
          section: 'help_form',
        }),
        status: true,
      }
    );

    const formAttributes = {
      component_id: 'website_contact_form',
      component_class: 'contact-form',
      method: 'POST',
      enctype: 'application/json',
      layout: 'contact-grid',
      submit_text: 'CONTACT US',
      action_url: `/api/form-submission?form_id=${contactFormBuilder.id}`,
    };

    await trx('form_builder')
      .where({ id: contactFormBuilder.id })
      .update({
        attributes: JSON.stringify(formAttributes),
        updated_at: new Date(),
      });

    contactFormBuilder.attributes = JSON.stringify(formAttributes);

    const siteSettings = buildSiteSettings(followUsMenu.menu_item_ids, headerMenu.menu_item_ids);

    await upsertPage(trx, orgId, 'site-settings', {
      type: 'settings',
      page_name_en: 'Site Settings',
      page_name_bn: 'সাইট সেটিংস',
      head: {
        title: 'Site Settings',
        robots: 'noindex',
      },
      body: [],
      body_raw: {
        navbar: [],
        slider: [],
        card: [],
        footer: [],
        media: [logo.id],
        menu: [],
      },
      additional: siteSettings,
      status: true,
    });

    await upsertPage(
      trx,
      orgId,
      'home',
      buildHomePage({
        heroSlider,
        contactCta,
        followUsMenuHeadless,
        followUsMenu,
        headerMenu,
        bannerMedia,
        siteSettings,
      })
    );

    await upsertPage(trx, orgId, 'about', buildAboutPage(whyBuyCardModels, whyBuyCardIds));

    await upsertPage(
      trx,
      orgId,
      'contact',
      buildContactPage(contactCta, {
        ...contactFormBuilder,
        attributes: formAttributes,
        elements: CONTACT_FORM_ELEMENTS,
      })
    );

    await upsertPage(trx, orgId, 'career', buildCareerPage());
  });
}

function createMockKnex() {
  const tables = {};
  let nextId = 1;

  function tableRows(name) {
    if (!tables[name]) tables[name] = [];
    return tables[name];
  }

  function matches(row, conditions) {
    return Object.entries(conditions).every(([key, value]) => row[key] === value);
  }

  function query(table) {
    const state = {
      conditions: [],
      inCondition: null,
      updateId: null,
      mode: 'select',
      payload: null,
    };

    const builder = {
      where(condition) {
        if (condition.id !== undefined && Object.keys(condition).length === 1) {
          state.updateId = condition.id;
        } else {
          state.conditions.push(condition);
        }
        return builder;
      },
      whereIn(column, values) {
        state.inCondition = { column, values };
        return builder;
      },
      first() {
        const row = tableRows(table).find((entry) => {
          if (state.inCondition) {
            return state.inCondition.values.includes(entry[state.inCondition.column]);
          }
          return state.conditions.every((condition) => matches(entry, condition));
        });
        return Promise.resolve(row || null);
      },
      update(payload) {
        const rows = tableRows(table);
        const index =
          state.updateId !== null
            ? rows.findIndex((entry) => entry.id === state.updateId)
            : rows.findIndex((entry) => state.conditions.every((condition) => matches(entry, condition)));

        if (index >= 0) {
          rows[index] = { ...rows[index], ...payload };
        }

        return Promise.resolve(1);
      },
      insert(payload) {
        state.mode = 'insert';
        state.payload = payload;
        return builder;
      },
      returning() {
        return builder;
      },
      then(resolve, reject) {
        try {
          if (state.mode === 'insert') {
            const row = { ...state.payload, id: nextId++ };
            tableRows(table).push(row);
            resolve([row]);
            return;
          }

          const rows = tableRows(table).filter((entry) => {
            if (state.inCondition) {
              return state.inCondition.values.includes(entry[state.inCondition.column]);
            }
            return state.conditions.every((condition) => matches(entry, condition));
          });

          resolve(rows);
        } catch (error) {
          reject(error);
        }
      },
    };

    return builder;
  }

  return {
    tables,
    transaction(fn) {
      return fn(query);
    },
  };
}

function parseJson(value: unknown, fallback: unknown = null) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeFixture(dir: string, name: string, data: unknown) {
  const filePath = path.join(dir, `${name}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`  wrote ${filePath}`);
}

async function exportFixtures() {
  const mock = createMockKnex();
  await seedCarVisionContent(mock, { id: 1 });

  const outDir = path.join(__dirname, '../src/seeds/data/car-vision');
  fs.mkdirSync(outDir, { recursive: true });

  const media = mock.tables.media.map((row) => ({
    id: row.id,
    title: row.title,
    file_name: row.file_name,
    file_type: row.file_type,
    file_path: row.file_path,
    file_size: row.file_size,
    tags: parseJson(row.tags),
  }));

  const menuitems = mock.tables.menu_items.map((row) => ({
    id: row.id,
    title: row.title,
    title_bn: row.title_bn,
    link: row.link,
    parent_id: row.parent_id,
  }));

  const navbars = mock.tables.navbars.map((row) => ({
    id: row.id,
    title_en: row.title_en,
    title_bn: row.title_bn,
    menu_item_ids: parseJson(row.menu_item_ids, []),
    logo_id: row.logo_id,
  }));

  const footers = mock.tables.footers.map((row) => ({
    id: row.id,
    title_en: row.title_en,
    title_bn: row.title_bn,
    footer_status: row.footer_status,
    logo_id: row.logo_id,
    address1_title_en: row.address1_title_en,
    address1_title_bn: row.address1_title_bn,
    address1_description_en: row.address1_description_en,
    address1_description_bn: row.address1_description_bn,
    address2_title_en: row.address2_title_en,
    address2_title_bn: row.address2_title_bn,
    address2_description_en: row.address2_description_en,
    address2_description_bn: row.address2_description_bn,
    address1_status: row.address1_status,
    address2_status: row.address2_status,
    column2_menu_item_ids: parseJson(row.column2_menu_item_ids, []),
    column2_status: row.column2_status,
    column3_menu_item_ids: parseJson(row.column3_menu_item_ids, []),
    column3_logos: parseJson(row.column3_logos, []),
    column3_status: row.column3_status,
    column4_title_en: row.column4_title_en,
    column4_title_bn: row.column4_title_bn,
    column4_image: row.column4_image,
    column4_text_en: row.column4_text_en,
    column4_text_bn: row.column4_text_bn,
    column4_menu_item_ids: parseJson(row.column4_menu_item_ids, []),
    column4_description_en: row.column4_description_en,
    column4_description_bn: row.column4_description_bn,
    column4_status: row.column4_status,
    bottom_menu_item_ids: parseJson(row.bottom_menu_item_ids, []),
  }));

  const cards = mock.tables.cards.map((row) => ({
    id: row.id,
    page_name: row.page_name,
    media_ids: parseJson(row.media_ids),
    title_en: row.title_en,
    title_bn: row.title_bn,
    description_en: row.description_en,
    description_bn: row.description_bn,
    link_url: row.link_url,
    additional: parseJson(row.additional),
    status: row.status,
  }));

  const sliders = mock.tables.sliders.map((row) => ({
    id: row.id,
    type: row.type,
    title_en: row.title_en,
    title_bn: row.title_bn,
    description_en: row.description_en,
    description_bn: row.description_bn,
    media_ids: parseJson(row.media_ids, []),
    card_ids: parseJson(row.card_ids, []),
    additional: parseJson(row.additional),
    status: row.status,
  }));

  const form_builders = mock.tables.form_builder.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    attributes: parseJson(row.attributes, {}),
    elements: parseJson(row.elements, []),
    additional: parseJson(row.additional),
    status: row.status,
  }));

  const pages = mock.tables.pages.map((row) => ({
    id: row.id,
    slug: row.slug,
    type: row.type,
    favicon_id: row.favicon_id ?? null,
    page_name_en: row.page_name_en,
    page_name_bn: row.page_name_bn,
    head: parseJson(row.head, {}),
    body: parseJson(row.body, []),
    additional: parseJson(row.additional),
    status: row.status,
  }));

  writeFixture(outDir, 'media', media);
  writeFixture(outDir, 'menuitems', menuitems);
  writeFixture(outDir, 'navbars', navbars);
  writeFixture(outDir, 'footers', footers);
  writeFixture(outDir, 'cards', cards);
  writeFixture(outDir, 'sliders', sliders);
  writeFixture(outDir, 'form_builders', form_builders);
  writeFixture(outDir, 'pages', pages);
}

exportFixtures().catch((error) => {
  console.error(error);
  process.exit(1);
});
