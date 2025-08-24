import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { ArrowLeft, Globe, Check, CheckCircle } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  description: string;
}

interface LanguageSelectionScreenProps {
  onBack: () => void;
  currentLanguage: string;
  onLanguageChange: (languageCode: string) => void;
}

const languages: Language[] = [
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    description: "language.default",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    description: "language.international",
  },
];

export function LanguageSelectionScreen({
  onBack,
  currentLanguage,
  onLanguageChange,
}: LanguageSelectionScreenProps) {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSave = async () => {
    if (selectedLanguage === currentLanguage) {
      onBack();
      return;
    }

    setIsLoading(true);
    try {
      i18n.changeLanguage(selectedLanguage);
      onLanguageChange(selectedLanguage);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onBack();
      }, 2000);
    } catch {
      // opcional: manejar error
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    const newLang = languages.find((l) => l.code === selectedLanguage);
    return (
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBack} onPress={onBack}>
            <ArrowLeft size={18} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("language.title")}</Text>
          <View style={{ width: 88 }} />
        </View>

        {/* Success Card */}
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.successIconWrap}>
              <CheckCircle size={32} color="#059669" />
            </View>
            <Text style={styles.successTitle}>{t("language.updated")}</Text>
            <Text style={styles.successText}>
              {t("language.changed_to", {
                flag: newLang?.flag,
                nativeName: newLang?.nativeName,
              })}
            </Text>
            <Text style={styles.noteText}>
              {t("language.restart")}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={onBack}>
          <ArrowLeft size={18} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("language.title")}</Text>
        <TouchableOpacity
          style={[styles.headerPrimaryBtn, isLoading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.headerPrimaryBtnText}>{t("button.save")}</Text>}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBadge}>
              <Globe size={18} color="#2563eb" />
            </View>
            <View>
              <Text style={styles.cardTitle}>{t("language.select")}</Text>
              <Text style={styles.cardDescription}>
                {t("language.description")}
              </Text>
            </View>
          </View>

          {/* Language list */}
          <View>
            {languages.map((language) => {
              const selected = selectedLanguage === language.code;
              const isCurrent = currentLanguage === language.code;

              return (
                <TouchableOpacity
                  key={language.code}
                  style={styles.langItem}
                  onPress={() => setSelectedLanguage(language.code)}
                  activeOpacity={0.8}
                >
                  {/* Radio */}
                  <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                    {selected ? <View style={styles.radioInner} /> : null}
                  </View>

                  {/* Info */}
                  <View style={styles.langInfo}>
                    <View style={styles.langRow}>
                      <Text style={styles.flag}>{language.flag}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.langNative}>{language.nativeName}</Text>
                        <Text style={styles.langName}>{t(`language.${language.name.toLowerCase()}`)}</Text>
                        <Text style={styles.langDesc}>{t(language.description)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Current marker */}
                  {isCurrent ? (
                    <View style={styles.currentWrap}>
                      <Check size={16} color="#059669" />
                      <Text style={styles.currentText}>{t("language.current")}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              <Text style={{ fontWeight: "700" }}>{t("language.note").split(":")[0]}: </Text>
              {t("language.note").split(":").slice(1).join(":")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  headerPrimaryBtn: {
    minWidth: 88,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#000000ff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerPrimaryBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  cardDescription: {
    fontSize: 13,
    color: "#6b7280",
  },

  langItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    backgroundColor: "#fff",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: "#000000ff",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#000000ff",
  },
  langInfo: {
    flex: 1,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flag: {
    fontSize: 22,
    marginRight: 8,
  },
  langNative: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  langName: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  langDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  currentWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 12,
  },
  currentText: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "600",
  },

  noteBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  noteText: {
    fontSize: 12,
    color: "#4b5563",
  },

  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#059669",
    textAlign: "center",
    marginBottom: 6,
  },
  successText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    marginBottom: 6,
  },
});
