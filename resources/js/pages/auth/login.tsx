import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AppLogoIcon from '@/components/app-logo-icon';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Map } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
            <Head title="Login Kredensial" />

            {/* Pattern Minimalis Belakang Form (Grid) */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

            {/* Aksen Blur Merah Minimalis */}
            <div className="absolute left-1/2 top-0 z-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-red-600/10 blur-[120px] dark:bg-red-900/20"></div>

            <div className="relative z-10 w-full max-w-[420px] px-6">
                
                {/* Bagian Atas / Header */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-xl shadow-red-900/20">
                        <Map className="h-8 w-8 stroke-[1.5]" />
                    </div>
                   
                </div>

                {/* Main Card Form */}
                <div className="rounded-2xl border border-zinc-200/60 bg-white/70 p-7 shadow-2xl backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/70">
                    
                    {status && (
                        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm text-green-600 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400">
                            {status}
                        </div>
                    )}

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="text-zinc-600 dark:text-zinc-300">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="admin@sistem.id"
                                            className="h-11 rounded-lg border-zinc-200 bg-zinc-50/50 transition-all focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:focus:border-red-500 dark:focus:bg-zinc-900"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-zinc-600 dark:text-zinc-300">Password</Label>
                                           
                                        </div>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            className="h-11 rounded-lg border-zinc-200 bg-zinc-50/50 transition-all focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:focus:border-red-500 dark:focus:bg-zinc-900"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center space-x-2 pt-2">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                                        />
                                        <Label htmlFor="remember" className="font-normal text-zinc-500 dark:text-zinc-400">
                                            Biarkan saya tetap masuk
                                        </Label>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-2 h-11 w-full rounded-lg bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                                    tabIndex={4}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Spinner className="mr-2" />
                                            Loading...
                                        </>
                                    ) : (
                                        'Login'
                                    )}
                                </Button>

                              
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </div>
    );
}
