import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "next-i18next";

import { NativeSelect } from "@mantine/core";

export const LanguageSwitcher: React.FC<{
  onChange?: (locale: string) => unknown;
}> = ({ onChange }) => {
  const { i18n } = useTranslation();
  const { language: currentLanguage } = i18n;
  const router = useRouter();
  const locales = router.locales ?? [currentLanguage];

  const [value, setValue] = useState(i18n.language);

  const switchToLocale = useCallback(
    (locale: string) => {
      const path = router.asPath;

      return router.push(path, path, { locale });
    },
    [router]
  );

  useEffect(() => {
    switchToLocale(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <NativeSelect
      value={value}
      data={locales}
      onChange={(event) => setValue(event.currentTarget.value)}
    />
  );
};

function capitalize(lang: string) {
  return lang.slice(0, 1).toUpperCase() + lang.slice(1);
}
