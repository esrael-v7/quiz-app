package com.example.quizapp.network;

import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import com.example.quizapp.security.TokenManager;
import java.io.IOException;

public class RetrofitClient {

    // Ensure you use HTTPS in production for Transit Security
    private static final String BASE_URL = "http://10.0.2.2:5000/api/"; 
    private static Retrofit retrofit = null;

    public static Retrofit getClient(TokenManager tokenManager) {
        if (retrofit == null) {
            
            // Interceptor to inject JWT Token securely
            Interceptor authInterceptor = new Interceptor() {
                @Override
                public Response intercept(Chain chain) throws IOException {
                    Request originalRequest = chain.request();
                    String token = tokenManager.getToken();

                    if (token != null) {
                        Request newRequest = originalRequest.newBuilder()
                                .header("Authorization", "Bearer " + token)
                                .build();
                        return chain.proceed(newRequest);
                    }
                    return chain.proceed(originalRequest);
                }
            };

            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(authInterceptor)
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }
}
