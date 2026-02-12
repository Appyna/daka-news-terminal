import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
} from 'react-native';
import { COLORS } from '../constants';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const [showLegal, setShowLegal] = useState<'cgu' | 'privacy' | 'mentions' | null>(null);

  const handleContact = () => {
    Linking.openURL('mailto:dakanewsapp@gmail.com');
  };

  const renderLegalContent = () => {
    if (!showLegal) return null;

    const cguContent = `CONDITIONS GÉNÉRALES D'UTILISATION (CGU) & CONDITIONS GÉNÉRALES DE VENTE (CGV)

DAKA News

Entrée en vigueur : 15 février 2026

Identité de l'éditeur : DAKA News
• Nom commercial : DAKA News
• Entité légale : DAKA News
• Email de contact : dakanewsapp@gmail.com
• Package iOS : com.dakanewsapp.dakanews
• Package Android : com.dakanewsapp.dakanews

Remarque : ce document est un modèle de CGU/CGV fourni à titre de brouillon. Il doit être relu et validé par un avocat inscrit au barreau compétent avant publication.

═══════════════════════════════════════════

1. DÉFINITIONS

• Application / Service : DAKA News, l'application mobile et le site web permettant l'agrégation, la traduction et l'affichage de titres d'actualités issues de flux RSS publics.
• Utilisateur / Vous : toute personne physique utilisant le Service.
• DAKA News / Nous : l'exploitant du Service.
• Contenu tiers : titres, extraits, articles et autres contenus fournis par des médias externes via flux RSS.
• Compte : espace personnel créé par l'Utilisateur (email, mot de passe, profil).
• Offre BASIC : accès gratuit au Service avec limitation à 3 sources.
• Offre PREMIUM : abonnement payant donnant accès à l'ensemble des sources (voir Section 6).

═══════════════════════════════════════════

2. OBJET

Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les conditions dans lesquelles DAKA News fournit l'accès à son Service et les conditions d'utilisation par l'Utilisateur.

Les Conditions Générales de Vente (CGV) définissent, quant à elles, les modalités de souscription, de facturation et de résiliation des Offres payantes.

═══════════════════════════════════════════

3. DESCRIPTION DU SERVICE

DAKA News propose :
• l'agrégation de titres et liens provenant de flux RSS publics (médias internationaux),
• la traduction automatique des titres et très courts extraits en français via un service d'intelligence artificielle (OpenAI GPT-4),
• l'affichage du titre traduit et du titre original, ainsi que l'indication claire de la source et un lien direct vers l'article d'origine.

DAKA News est un agrégateur ; il n'est pas éditeur des contenus tiers. Les contenus (titres, articles) restent la propriété exclusive des médias sources.

DAKA News conserve temporairement les titres et traductions en base de données pendant une durée maximale de 24 heures, après quoi ces éléments sont automatiquement purgés.

═══════════════════════════════════════════

4. ACCÈS ET CRÉATION DE COMPTE

4.1. Conditions d'accès
• L'accès au Service nécessite la création d'un Compte (email, mot de passe, username).
• L'Utilisateur s'engage à fournir des informations sincères et à jour.

4.2. Sécurité
• Vous êtes responsable de la confidentialité de vos identifiants. Toute connexion réalisée avec vos identifiants est réputée effectuée par vous.
• En cas d'usage frauduleux, signalez-le immédiatement à dakanewsapp@gmail.com.

4.3. Suspension / suppression
• DAKA News se réserve le droit de suspendre ou supprimer un Compte en cas de violation grave des CGU (fraude, scraping de l'API, revente du service, etc.).

═══════════════════════════════════════════

5. CONTENU ET PROPRIÉTÉ INTELLECTUELLE

5.1. Contenus tiers
• Les titres et liens affichés proviennent de flux RSS publics fournis par des éditeurs tiers.
• DAKA News ne revendique aucun droit de propriété sur ces contenus.
• Toute demande de retrait ou d'exclusion d'un flux doit être adressée à dakanewsapp@gmail.com avec preuves d'identité et justification; DAKA News s'engage à traiter et, le cas échéant, à retirer le flux dans les meilleurs délais.

5.2. Sources tierces et retrait

DAKA News agit exclusivement en qualité d'agrégateur technique de flux RSS publics accessibles sans restriction d'accès, sans contournement de mesures techniques de protection, de paywalls ou de restrictions contractuelles imposées par les éditeurs.

          Les flux relatifs à l'actualité israélienne sont collectés via la plateforme tierce Mivzakim (https://mivzakim.net/), tandis que les flux relatifs à l'actualité française et internationale sont collectés via la plateforme tierce RSS.app (https://rss.app).

Ces plateformes agissent en tant qu'intermédiaires techniques d'agrégation de flux RSS publics, sans lien capitalistique ou contractuel avec DAKA News.

En cas de modification des conditions d'accès, de suppression d'un flux, ou de demande expresse de retrait formulée par un éditeur, une plateforme intermédiaire ou tout ayant droit légitime, DAKA News s'engage à suspendre ou supprimer sans délai indu l'accès aux flux concernés, et au plus tard dans un délai de quarante-huit (48) heures après réception de la demande.

Cette suppression pourra intervenir sans préavis et sans que la responsabilité de DAKA News ne puisse être engagée à ce titre.

5.3. Contenus DAKA News
• Le code source, l'interface, le design, le logo et les traductions générées par DAKA News sont la propriété exclusive de DAKA News (sauf disposition contraire). Toute reproduction non autorisée est interdite.

5.4. Traductions automatiques — CLAUSE ESSENTIELLE
Les traductions sont générées automatiquement par intelligence artificielle (OpenAI GPT-4) selon un prompt éditorial prédéfini. Bien que nous utilisions un système de traduction avancé avec règles strictes de neutralité et fidélité, DAKA News ne peut garantir à 100% l'exactitude, la justesse ou l'absence de biais dans les traductions automatiques. Les utilisateurs sont invités à consulter l'article original (lien fourni) en cas de doute. DAKA News n'est pas responsable des erreurs de traduction ou d'interprétation dues à l'automatisation.

═══════════════════════════════════════════

6. CONDITIONS COMMERCIALES — ABONNEMENTS (CGV)

6.1. Offres
• Offre BASIC : gratuite, accès limité à 3 sources.
• Offre PREMIUM : 1,99 € / mois (prix indicatif), accès à l'ensemble des sources (plus de 20). Facturation automatique mensuelle.

6.2. Modalités de paiement
• Paiement via Stripe (web) et via Apple In-App Purchase / Google Play Billing sur mobile.
• Les abonnements Apple/Google sont gérés par Apple/Google conformément à leurs conditions.

6.3. Renouvellement automatique
• Les abonnements Premium se renouvellent automatiquement chaque mois jusqu'à résiliation.

6.4. Résiliation / remboursement
• L'Utilisateur peut annuler son abonnement à tout moment. L'accès Premium demeure valable jusqu'à la fin de la période déjà payée.
• AUCUN REMBOURSEMENT PRORATA pour une période mensuelle entamée (sauf obligations légales impératives ou cas exceptionnel évalué par DAKA News).

6.5. Facturation et conservation
• Les factures sont effectuées via Stripe ou via Apple/Google selon le cas. Les copies de factures sont conservées 10 ans.

6.6. Prix
• Les prix annoncés sont toutes taxes comprises. DAKA News se réserve le droit d'ajuster les tarifs, en informant préalablement les Utilisateurs.

═══════════════════════════════════════════

7. DONNÉES PERSONNELLES & CONFIDENTIALITÉ

Pour la politique complète, consultez la Politique de Confidentialité (document distinct) disponible sur l'application et le site.

Points clés :
• Données collectées : email, mot de passe (hashé), username, données d'abonnement, push tokens, préférences.
• Finalités : authentification, gestion abonnement, notifications, sécurité.
• Conservation : données compte (tant que compte actif); titres/traductions (24h); logs (7 jours); factures Stripe (10 ans).
• Contact RGPD : dakanewsapp@gmail.com
• Les données ne sont JAMAIS vendues à des tiers.

═══════════════════════════════════════════

8. OBLIGATIONS ET RESPONSABILITÉS

8.1. Responsabilité de DAKA News
• Service fourni « en l'état ». Aucune garantie d'accessibilité continue.
• DAKA News n'est pas responsable :
  - de l'exactitude des contenus tiers
  - des propos diffamatoires des médias sources
  - des interruptions, bugs
  - des erreurs de traduction IA

8.2. Responsabilité de l'Utilisateur
• Ne pas contourner de paywalls, ne pas scraper l'API, ne pas revendre l'accès.

8.3. Limitation de responsabilité
• Responsabilité globale limitée au montant perçu sur 12 mois précédents.

═══════════════════════════════════════════

9. PROPRIÉTÉ INTELLECTUELLE

• Titres et contenus : propriété des éditeurs originaux.
• Traductions DAKA News : propriété de DAKA News (usage personnel et non commercial).

═══════════════════════════════════════════

10. PROCÉDURE DE RETRAIT / DÉRÉFÉRENCEMENT

• Demande de retrait : dakanewsapp@gmail.com avec identification, preuve de propriété, URL du flux.
• Accusé réception sous 7 jours ouvrés, réponse sous 30 jours.

═══════════════════════════════════════════

11. MODIFICATIONS DES CGU/CGV

• DAKA News peut modifier ces conditions. Notification par email/push pour changements majeurs (30 jours de délai).
• Poursuite d'utilisation = acceptation des nouvelles conditions.

═══════════════════════════════════════════

12. DROIT APPLICABLE ET JURIDICTION

• Droit applicable : loi française.
• Juridiction : tribunaux de Paris (sauf lieu de résidence du consommateur).
• Médiation amiable préalable recommandée (plateforme européenne ODR).

═══════════════════════════════════════════

13. DIVERS

• Disposition invalide : autres dispositions restent en vigueur.
• Tolérance ne vaut pas renonciation.

═══════════════════════════════════════════

14. CONTACT

• Contact général / RGPD / DPO : dakanewsapp@gmail.com
• Questions commerciales : dakanewsapp@gmail.com

═══════════════════════════════════════════

ANNEXES À COMPLÉTER PAR L'AVOCAT AVANT PUBLICATION :
• Renseignements légaux complets de l'entité
• TVA et mentions fiscales
• Mentions légales site web
• Clauses Apple/Google In-App Purchase
• Clause consommateur (droit de rétractation)`;

    const privacyContent = `POLITIQUE DE CONFIDENTIALITÉ – DAKA NEWS

**Dernière mise à jour : 15 février 2026**

La présente Politique de confidentialité a pour objectif d'informer les utilisateurs de l'application **DAKA News** (ci‑après « l'Application ») sur la manière dont leurs données personnelles sont collectées, utilisées et protégées, conformément au **Règlement Général sur la Protection des Données (RGPD)** et, le cas échéant, à la **loi israélienne sur la protection de la vie privée (Privacy Protection Law, 1981)**.

═══════════════════════════════════════════

**1. RESPONSABLE DU TRAITEMENT**

Le responsable du traitement est :

• Nom d'entité : **DAKA News**
• Email de contact : dakanewsapp@gmail.com

═══════════════════════════════════════════

**2. DONNÉES COLLECTÉES**

DAKA News collecte uniquement les données strictement nécessaires au fonctionnement de l'Application.

**2.1 Données collectées automatiquement**

Lors de l'utilisation de l'Application, les données suivantes peuvent être collectées :

• Adresse IP (anonymisée ou partiellement anonymisée lorsque possible)
• Type d'appareil, système d'exploitation, version de l'application
• Données de navigation internes (flux consultés, fréquence d'utilisation)

Ces données sont collectées à des fins statistiques, de sécurité et d'amélioration du service.

**2.2 Données fournies par l'utilisateur**

Selon les fonctionnalités activées, l'Application peut collecter :

• Adresse email (en cas de création de compte ou de contact)
• Informations liées à l'abonnement (via Apple App Store ou Google Play)

DAKA News ne collecte **aucune donnée sensible** au sens du RGPD.

═══════════════════════════════════════════

**3. CONTENU ÉDITORIAL ET FLUX RSS**

DAKA News agrège des **flux RSS publics** provenant de médias internationaux.

• Les contenus affichés se limitent **au titre des articles** (une phrase maximum)
• Ces titres sont **traduits automatiquement** en français à l'aide d'une intelligence artificielle
• Le titre original dans la langue source peut également être affiché

Les contenus sont stockés temporairement dans une base de données interne **pour une durée maximale de 24 heures**, uniquement afin de permettre l'affichage dans l'Application.

Aucun article complet n'est reproduit ni stocké.

═══════════════════════════════════════════

**4. FINALITÉS DU TRAITEMENT**

Les données personnelles sont traitées pour les finalités suivantes :

• Fourniture et fonctionnement de l'Application
• Affichage de contenus d'actualité traduits
• Gestion des abonnements et limitations de flux
• Sécurité et prévention des abus
• Statistiques anonymes d'utilisation

═══════════════════════════════════════════

**5. BASE LÉGALE DU TRAITEMENT**

Les traitements reposent sur :

• L'exécution du contrat (fourniture du service)
• L'intérêt légitime de DAKA News (sécurité, amélioration du service)
• Le consentement de l'utilisateur lorsque requis

═══════════════════════════════════════════

**6. PARTAGE DES DONNÉES**

Les données personnelles ne sont **ni vendues ni louées**.

Elles peuvent être partagées uniquement avec :

• Prestataires techniques (hébergement, infrastructure, outils d'analyse)
• Plateformes de paiement (Apple / Google), qui agissent en tant que responsables indépendants

Aucun partenaire éditorial ou média source ne reçoit de données personnelles des utilisateurs.

═══════════════════════════════════════════

**7. TRANSFERTS INTERNATIONAUX**

Certaines données peuvent être traitées hors de l'Union européenne, notamment lorsque des prestataires techniques sont situés dans des pays tiers.

Dans ce cas, DAKA News s'assure que des garanties appropriées sont en place (clauses contractuelles types, mesures de sécurité renforcées).

═══════════════════════════════════════════

**8. DURÉE DE CONSERVATION**

• Données de contenus (titres RSS traduits) : **24 heures maximum**
• Données de compte : durée de l'utilisation du service
• Données techniques et statistiques : durée limitée et proportionnée

═══════════════════════════════════════════

**9. SÉCURITÉ**

DAKA News met en œuvre des mesures techniques et organisationnelles appropriées afin de garantir la sécurité des données personnelles et d'empêcher tout accès non autorisé, perte ou divulgation.

═══════════════════════════════════════════

**10. DROITS DES UTILISATEURS**

Conformément au RGPD, les utilisateurs disposent des droits suivants :

• Droit d'accès
• Droit de rectification
• Droit à l'effacement
• Droit à la limitation du traitement
• Droit d'opposition
• Droit à la portabilité des données

Les demandes peuvent être adressées à : dakanewsapp@gmail.com

Les utilisateurs disposent également du droit d'introduire une réclamation auprès de l'autorité de contrôle compétente.

═══════════════════════════════════════════

**11. UTILISATEURS ISRAÉLIENS**

Pour les utilisateurs situés en Israël, les traitements sont également conformes à la **Privacy Protection Law, 1981**, et aux règlements applicables.

═══════════════════════════════════════════

**12. MODIFICATION DE LA POLITIQUE**

DAKA News se réserve le droit de modifier la présente Politique de confidentialité à tout moment.

Les utilisateurs seront informés de toute modification substantielle via l'Application.

═══════════════════════════════════════════

**13. CONTACT**

Pour toute question relative à la présente Politique de confidentialité :

• Email : dakanewsapp@gmail.com

**DAKA News n'est affilié à aucun des médias cités.**`;

    const mentionsContent = `MENTIONS LÉGALES – DAKA NEWS

Conformément aux dispositions légales applicables, les présentes Mentions légales ont pour objet d'informer les utilisateurs de l'application **DAKA News** (ci-après « l'Application ») sur l'identité de l'éditeur et les conditions d'utilisation du service.

═══════════════════════════════════════════

**1. ÉDITEUR DE L'APPLICATION**

Nom de l'application : **DAKA News**

Éditeur : DAKA News

Email de contact : dakanewsapp@gmail.com

═══════════════════════════════════════════

**2. HÉBERGEMENT**

L'Application et les données associées sont hébergées par :

Nom de l'hébergeur : Render
Site web : render.com

═══════════════════════════════════════════

**3. OBJET DE L'APPLICATION**

DAKA News est une application d'information permettant aux utilisateurs d'accéder à des **titres d'actualité issus de flux RSS publics** provenant de médias internationaux.

Les fonctionnalités principales incluent :

• Agrégation de flux RSS publics
• Traduction automatique des titres en langue française
• Affichage du titre original dans la langue source
• Redirection vers l'article original via un lien externe

DAKA News ne publie **aucun article complet** et ne modifie pas le contenu éditorial des sources.

═══════════════════════════════════════════

**4. SOURCES TIERCES ET RETRAIT**

DAKA News agit exclusivement en qualité d'agrégateur technique de flux RSS publics accessibles sans restriction d'accès, sans contournement de mesures techniques de protection, de paywalls ou de restrictions contractuelles imposées par les éditeurs.

          Les flux relatifs à l'actualité israélienne sont collectés via la plateforme tierce Mivzakim (https://mivzakim.net/), tandis que les flux relatifs à l'actualité française et internationale sont collectés via la plateforme tierce RSS.app (https://rss.app).

Ces plateformes agissent en tant qu'intermédiaires techniques d'agrégation de flux RSS publics, sans lien capitalistique ou contractuel avec DAKA News.

En cas de modification des conditions d'accès, de suppression d'un flux, ou de demande expresse de retrait formulée par un éditeur, une plateforme intermédiaire ou tout ayant droit légitime, DAKA News s'engage à suspendre ou supprimer sans délai indu l'accès aux flux concernés, et au plus tard dans un délai de quarante-huit (48) heures après réception de la demande.

Cette suppression pourra intervenir sans préavis et sans que la responsabilité de DAKA News ne puisse être engagée à ce titre.

═══════════════════════════════════════════

**5. PROPRIÉTÉ INTELLECTUELLE**

L'ensemble des éléments constituant l'Application (structure, interface, textes propres à l'Application, code, bases de données, nom DAKA News) est protégé par le droit de la propriété intellectuelle.

Les titres d'articles affichés proviennent de **flux RSS publics** appartenant à leurs éditeurs respectifs.

Les noms des médias sont mentionnés **à titre informatif uniquement**, sans reproduction de logos ni éléments graphiques protégés.

Toute reproduction, représentation ou exploitation non autorisée des éléments propres à DAKA News est interdite.

═══════════════════════════════════════════

**6. ABSENCE D'AFFILIATION**

DAKA News est une application **indépendante**.

Elle n'est affiliée, associée, sponsorisée ou approuvée par aucun des médias, éditeurs ou plateformes dont les flux RSS sont référencés dans l'Application.

═══════════════════════════════════════════

**7. RESPONSABILITÉ**

DAKA News agit en tant qu'outil technique d'agrégation et de traduction automatique.

L'éditeur ne saurait être tenu responsable :

• Du contenu éditorial publié par les médias sources
• Des erreurs éventuelles de traduction automatique
• De l'indisponibilité temporaire de certains flux RSS
• Du contenu des sites tiers accessibles via les liens externes

L'utilisateur est invité à consulter l'article original sur le site source pour toute vérification ou information complète.

═══════════════════════════════════════════

**8. DONNÉES PERSONNELLES**

Le traitement des données personnelles est décrit dans la **Politique de confidentialité** de l'Application.

═══════════════════════════════════════════

**9. DROIT APPLICABLE**

Les présentes Mentions légales sont soumises :

• Au **droit français** pour les utilisateurs situés dans l'Union européenne
• Le cas échéant, au **droit israélien** pour les utilisateurs situés en Israël

En cas de litige, la juridiction compétente sera déterminée conformément aux règles légales applicables.

═══════════════════════════════════════════

**10. CONTACT**

Pour toute question relative à l'Application ou aux présentes Mentions légales :

Email : dakanewsapp@gmail.com`;

    const title = 
      showLegal === 'cgu' ? 'Conditions Générales' : 
      showLegal === 'privacy' ? 'Politique de Confidentialité' :
      'Mentions Légales';
    
    const content = 
      showLegal === 'cgu' ? cguContent : 
      showLegal === 'privacy' ? privacyContent :
      mentionsContent;

    return (
      <Modal visible animationType="slide" transparent onRequestClose={() => setShowLegal(null)}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setShowLegal(null)} />
          
          <View style={styles.legalContainer}>
            <View style={styles.headerGradient} />
            
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowLegal(null)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.legalContent}>
              <Text style={styles.legalTitle}>{title}</Text>
              <Text style={styles.legalText}>{content}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={onClose} />
          
          <View style={styles.container}>
            <View style={styles.headerGradient} />
            
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.content}>
              <TouchableOpacity style={styles.item} onPress={() => setShowLegal('cgu')}>
                <Text style={styles.itemText}>Conditions Générales (CGU/CGV)</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.item} onPress={() => setShowLegal('privacy')}>
                <Text style={styles.itemText}>Politique de Confidentialité</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.item} onPress={() => setShowLegal('mentions')}>
                <Text style={styles.itemText}>Mentions Légales</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.item} onPress={handleContact}>
                <Text style={styles.itemText}>Contactez-nous</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {renderLegalContent()}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    backgroundColor: COLORS.dark2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.2)',
  },
  legalContainer: {
    backgroundColor: COLORS.dark2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.2)',
  },
  headerGradient: {
    height: 4,
    backgroundColor: COLORS.accentYellow1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: '300',
  },
  content: {
    padding: 24,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  itemText: {
    fontSize: 16,
    color: COLORS.white,
  },
  arrow: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  footer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 24,
  },
  legalContent: {
    padding: 24,
  },
  legalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accentYellow1,
    marginBottom: 20,
  },
  legalText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
  },
});
