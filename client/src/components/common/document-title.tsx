const APP_NAME = 'Simplewealth';

export function DocumentTitle({ title }: { title: string }) {
  return <title>{`${title} · ${APP_NAME}`}</title>;
}
