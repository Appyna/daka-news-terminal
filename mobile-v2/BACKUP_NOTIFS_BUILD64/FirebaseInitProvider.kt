package app.dakanews.com

import android.content.ContentProvider
import android.content.ContentValues
import android.database.Cursor
import android.net.Uri
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions

/**
 * ContentProvider qui initialise Firebase EN TOUT PREMIER
 * Les ContentProviders sont initialisés AVANT la classe Application
 * C'est LA SEULE façon de garantir que Firebase est prêt avant expo-notifications
 */
class FirebaseInitProvider : ContentProvider() {
    
    override fun onCreate(): Boolean {
        val context = context ?: return false
        
        android.util.Log.d("DAKA_FIREBASE", "🔥 ContentProvider onCreate() DÉMARRÉ 🔥")
        
        try {
            // Vérifier si déjà initialisé
            val existingApps = FirebaseApp.getApps(context)
            if (existingApps.isNotEmpty()) {
                android.util.Log.d("DAKA_FIREBASE", "✅ Firebase already initialized (${existingApps.size} apps)")
                return true
            }
            
            android.util.Log.d("DAKA_FIREBASE", "🔧 Initialisation Firebase via ressources générées...")
            
            // ✅ CONFIGURATION MANUELLE MAIS LISANT LES RESSOURCES GÉNÉRÉES PAR google-services plugin
            val resources = context.resources
            val packageName = context.packageName
            
            // Récupérer les IDs des ressources générées par google-services plugin
            val appIdRes = resources.getIdentifier("google_app_id", "string", packageName)
            val apiKeyRes = resources.getIdentifier("google_api_key", "string", packageName)
            val projectIdRes = resources.getIdentifier("project_id", "string", packageName)
            val gcmSenderIdRes = resources.getIdentifier("gcm_defaultSenderId", "string", packageName)
            
            if (appIdRes == 0 || apiKeyRes == 0) {
                android.util.Log.e("DAKA_FIREBASE", "❌ ERREUR: Ressources Firebase non trouvées (google-services.json non traité)")
                return false
            }
            
            val appId = resources.getString(appIdRes)
            val apiKey = resources.getString(apiKeyRes)
            val projectId = if (projectIdRes != 0) resources.getString(projectIdRes) else "daka-news-android-notifs"
            val gcmSenderId = if (gcmSenderIdRes != 0) resources.getString(gcmSenderIdRes) else "745386523668"
            
            android.util.Log.d("DAKA_FIREBASE", "📋 Config: appId=$appId, apiKey=$apiKey")
            
            val options = FirebaseOptions.Builder()
                .setApplicationId(appId)
                .setApiKey(apiKey)
                .setProjectId(projectId)
                .setGcmSenderId(gcmSenderId)
                .build()
            
            FirebaseApp.initializeApp(context, options)
            android.util.Log.d("DAKA_FIREBASE", "✅ ✅ ✅ Firebase initialized in ContentProvider SUCCESSFULLY ✅ ✅ ✅")
            return true
            
        } catch (e: Exception) {
            android.util.Log.e("DAKA_FIREBASE", "❌ ❌ ❌ ContentProvider Firebase init FAILED: ${e.message}")
            android.util.Log.e("DAKA_FIREBASE", "Stack: ${e.stackTraceToString()}")
            return false
        }
    }
    
    // Méthodes requises par ContentProvider (non utilisées)
    override fun query(uri: Uri, projection: Array<String>?, selection: String?, selectionArgs: Array<String>?, sortOrder: String?): Cursor? = null
    override fun getType(uri: Uri): String? = null
    override fun insert(uri: Uri, values: ContentValues?): Uri? = null
    override fun delete(uri: Uri, selection: String?, selectionArgs: Array<String>?): Int = 0
    override fun update(uri: Uri, values: ContentValues?, selection: String?, selectionArgs: Array<String>?): Int = 0
}
