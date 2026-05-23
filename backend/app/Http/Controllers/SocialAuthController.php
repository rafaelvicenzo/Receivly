<?php

namespace App\Http\Controllers;

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirect(string $provider)
    {
        /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
        $driver = Socialite::driver($provider);
        return $driver->stateless()->redirect();
    }

    public function callback(string $provider)
    {
        try {
            /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
            $driver = Socialite::driver($provider);
            $socialUser = $driver->stateless()->user();

            $user = User::updateOrCreate(
                ['email' => $socialUser->getEmail()],
                [
                    'name'              => $socialUser->getName(),
                    'provider'          => $provider,
                    'provider_id'       => $socialUser->getId(),
                    'email_verified_at' => now(),
                    'password'          => bcrypt(str()->random(24)),
                ]
            );

            $token = $user->createToken('auth_token')->plainTextToken;

            return redirect("http://localhost:4200/auth/social?token={$token}&name={$user->name}");

        } catch (\Exception $e) {
            return redirect("http://localhost:4200/login?error=social_auth_failed");
        }
    }
}