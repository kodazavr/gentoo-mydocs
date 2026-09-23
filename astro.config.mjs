import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://kodazavr.github.io',
  base: '/gentoo-mydocs',
  integrations: [
    starlight({
      title: 'Gentoo Linux Documentation',
      description: 'Практическая документация по Gentoo Linux.',
      defaultLocale: 'ru',
      locales: {
        root: { label: 'Русский', lang: 'ru' },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/kodazavr/gentoo-mydocs',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/kodazavr/gentoo-mydocs/edit/gh-pages/',
      },
      sidebar: [
        { label: 'Главная', link: '/' },
        {
          label: 'Установка и загрузка',
          items: [{ autogenerate: { directory: 'installation' } }],
        },
        {
          label: 'Рабочий стол',
          items: [{ autogenerate: { directory: 'desktop' } }],
        },
        {
          label: 'Файловая система',
          items: [{ autogenerate: { directory: 'filesystem' } }],
        },
        {
          label: 'Железо',
          items: [{ autogenerate: { directory: 'hardware' } }],
        },
        {
          label: 'Сеть',
          items: [{ autogenerate: { directory: 'networking' } }],
        },
        {
          label: 'Безопасность',
          items: [{ autogenerate: { directory: 'security' } }],
        },
        {
          label: 'Управление пакетами',
          items: [{ autogenerate: { directory: 'managed' } }],
        },
        {
          label: 'Настройки',
          items: [{ autogenerate: { directory: 'settings' } }],
        },
        {
          label: 'Системы',
          items: [{ autogenerate: { directory: 'systems' } }],
        },
        {
          label: 'Решение проблем',
          items: [{ autogenerate: { directory: 'troubleshooting' } }],
        },
        {
          label: 'Исследования',
          items: [{ autogenerate: { directory: 'experiments' } }],
        },
        {
          label: 'О проекте',
          items: [
            { slug: 'documentation-policy' },
            { slug: 'contributing' },
            { slug: 'documentation-inventory' },
          ],
        },
      ],
      lastUpdated: true,
    }),
  ],
});