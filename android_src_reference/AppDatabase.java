package com.example.quizapp.database;

import android.content.Context;
import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;
import net.sqlcipher.database.SQLiteDatabase;
import net.sqlcipher.database.SupportFactory;
import com.example.quizapp.models.Category;
import com.example.quizapp.models.Question;

@Database(entities = {Category.class, Question.class}, version = 1)
public abstract class AppDatabase extends RoomDatabase {

    public abstract QuizDao quizDao();

    private static volatile AppDatabase INSTANCE;

    public static AppDatabase getDatabase(final Context context) {
        if (INSTANCE == null) {
            synchronized (AppDatabase.class) {
                if (INSTANCE == null) {
                    
                    // Local Data Encryption using SQLCipher
                    final byte[] passphrase = SQLiteDatabase.getBytes("your_secure_passphrase_here".toCharArray());
                    SupportFactory factory = new SupportFactory(passphrase);

                    INSTANCE = Room.databaseBuilder(context.getApplicationContext(),
                            AppDatabase.class, "quiz_encrypted_database")
                            .openHelperFactory(factory) // Injects SQLCipher
                            .build();
                }
            }
        }
        return INSTANCE;
    }
}
